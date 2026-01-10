import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
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

export const animes = pgTable("animes", {
  id: serial("id").primaryKey(),
  malId: integer("mal_id").notNull(), // MyAnimeList ID
  title: text("title").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  genres: text("genres").array(),
  videoUrl: text("video_url").notNull(), // The stream source
  quality: text("quality").default("720p"),
  uploaderId: integer("uploader_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  animeId: integer("anime_id").notNull().references(() => animes.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  animes: many(animes),
  comments: many(comments),
}));

export const animesRelations = relations(animes, ({ one, many }) => ({
  uploader: one(users, {
    fields: [animes.uploaderId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  anime: one(animes, {
    fields: [comments.animeId],
    references: [animes.id],
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
export type CreateCommentRequest = Pick<InsertComment, "content" | "animeId">;

// Response types
export type AuthResponse = User;
export type AnimeResponse = Anime & { uploader?: User };
export type CommentResponse = Comment & { user?: User };
