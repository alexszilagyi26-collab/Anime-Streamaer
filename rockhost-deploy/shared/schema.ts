import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Anime table matching existing Supabase structure
export const animes = pgTable("anime", {
  id: uuid("id").defaultRandom().primaryKey(),
  animeNev: text("anime_nev").notNull(), // title
  myAnimeListId: integer("myanimelist_id"), // can be null
  mufajok: text("mufajok"), // genres as text (not array)
  boritokep: text("boritokep"), // cover image
  videoLink: text("video_link").default(""), // video URL
  epizodSzam: integer("epizod_szam").default(1), // episode number
  leiras: text("leiras").default(""), // description
  status: text("status").default("aktiv"), // status (aktiv, etc.)
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  animeId: text("anime_id").notNull(), // Changed to text to match UUID
  createdAt: timestamp("created_at").defaultNow(),
});

//=== RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  comments: many(comments),
}));

export const animesRelations = relations(animes, ({ many }) => ({
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, isAdmin: true });
export const insertAnimeSchema = createInsertSchema(animes).omit({ id: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Anime = typeof animes.$inferSelect;
export type InsertAnime = z.infer<typeof insertAnimeSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

// Request types
export type LoginRequest = Pick<InsertUser, "email" | "password">;
export type RegisterRequest = InsertUser;

export type CreateAnimeRequest = InsertAnime;
export type CreateCommentRequest = Pick<InsertComment, "content"> & { animeId: string };

// Response types
export type AuthResponse = User;
export type AnimeResponse = Anime;
export type CommentResponse = Comment & { user?: User };
