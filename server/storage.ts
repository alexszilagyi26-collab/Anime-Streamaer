import { db } from "./db";
import {
  users, animes, comments,
  type User, type InsertUser,
  type Anime, type InsertAnime,
  type Comment, type InsertComment
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Anime
  getAnimes(): Promise<(Anime & { uploader: User })[]>;
  getAnime(id: number): Promise<(Anime & { uploader: User }) | undefined>;
  createAnime(anime: InsertAnime): Promise<Anime>;

  // Comment
  getComments(animeId: number): Promise<(Comment & { user: User })[]>;
  createComment(comment: InsertComment): Promise<Comment>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAnimes(): Promise<(Anime & { uploader: User })[]> {
    const rows = await db
      .select({
        anime: animes,
        uploader: users,
      })
      .from(animes)
      .leftJoin(users, eq(animes.uploaderId, users.id))
      .orderBy(desc(animes.createdAt));
    
    return rows.map(row => ({ ...row.anime, uploader: row.uploader! }));
  }

  async getAnime(id: number): Promise<(Anime & { uploader: User }) | undefined> {
    const [row] = await db
      .select({
        anime: animes,
        uploader: users,
      })
      .from(animes)
      .leftJoin(users, eq(animes.uploaderId, users.id))
      .where(eq(animes.id, id));
    
    if (!row) return undefined;
    return { ...row.anime, uploader: row.uploader! };
  }

  async createAnime(insertAnime: InsertAnime): Promise<Anime> {
    const [anime] = await db.insert(animes).values(insertAnime).returning();
    return anime;
  }

  async getComments(animeId: number): Promise<(Comment & { user: User })[]> {
    const rows = await db
      .select({
        comment: comments,
        user: users,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.animeId, animeId))
      .orderBy(desc(comments.createdAt));
      
    return rows.map(row => ({ ...row.comment, user: row.user }));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }
}

export const storage = new DatabaseStorage();
