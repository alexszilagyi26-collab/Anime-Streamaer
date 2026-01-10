import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { users } from "@shared/schema";
import MemoryStore from "memorystore";

const scryptAsync = promisify(scrypt);
const SessionStore = MemoryStore(session);

// Auth helper functions
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // === AUTH SETUP ===
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "axel_sub_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: app.get("env") === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }
        if (!(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // === AUTH ROUTES ===

  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(input.email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already exists" });
      }

      const existingUsername = await storage.getUserByUsername(input.username);
      if (existingUsername) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      next(err);
    }
  });

  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  // === APP ROUTES ===

  // ANIME
  app.get(api.animes.list.path, async (req, res) => {
    const animes = await storage.getAnimes();
    // Simple filter if query params present (in memory for now, optimize with DB queries later)
    let filtered = animes;
    const search = req.query.search as string;
    if (search) {
      filtered = filtered.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
    }
    res.json(filtered);
  });

  app.get(api.animes.get.path, async (req, res) => {
    const anime = await storage.getAnime(Number(req.params.id));
    if (!anime) return res.status(404).json({ message: "Anime not found" });
    res.json(anime);
  });

  app.post(api.animes.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.animes.create.input.parse(req.body);
      const anime = await storage.createAnime({
        ...input,
        uploaderId: (req.user as any).id
      });
      res.status(201).json(anime);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // COMMENTS
  app.get(api.comments.list.path, async (req, res) => {
    const comments = await storage.getComments(Number(req.params.animeId));
    res.json(comments);
  });

  app.post(api.comments.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.comments.create.input.parse(req.body);
      const comment = await storage.createComment({
        ...input,
        animeId: Number(req.params.animeId),
        userId: (req.user as any).id
      });
      res.status(201).json(comment);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // PROXY JIKAN API
  app.get(api.animes.searchJikan.path, async (req, res) => {
    try {
      const q = req.query.q as string;
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&sfw`);
      const data = await response.json();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch from Jikan API" });
    }
  });

  // === SEED DATA ===
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const users = await storage.getUserByUsername("axel_admin");
  if (!users) {
    const hashedPassword = await hashPassword("admin123");
    const admin = await storage.createUser({
      username: "axel_admin",
      email: "admin@axelsub.com",
      password: hashedPassword,
      bio: "Administrator of AXEL SUB",
      isAdmin: true,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=axel"
    });

    // Seed some animes
    await storage.createAnime({
      malId: 1, 
      title: "Cowboy Bebop",
      description: "In the year 2071, humanity has colonized several of the solar system's planets and moons...",
      coverImage: "https://cdn.myanimelist.net/images/anime/4/19644.jpg",
      genres: ["Action", "Sci-Fi"],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // Placeholder
      uploaderId: admin.id
    });
    
    await storage.createAnime({
      malId: 20, 
      title: "Naruto",
      description: "Moments prior to Naruto Uzumaki's birth, a huge demon known as the Kyuubi, the Nine-Tailed Fox, attacked Konohagakure...",
      coverImage: "https://cdn.myanimelist.net/images/anime/13/17405.jpg",
      genres: ["Action", "Adventure"],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", // Placeholder
      uploaderId: admin.id
    });
  }
}
