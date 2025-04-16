import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Existing users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Mood types
export const moodTypes = ["great", "good", "neutral", "bad", "terrible"] as const;
export type MoodType = typeof moodTypes[number];

// Mood entries table
export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  mood: text("mood", { enum: moodTypes }).notNull(),
  notes: text("notes"),
  factors: text("factors").array(),
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries)
  .omit({ id: true })
  .extend({
    // Override the date field to accept string in ISO format
    date: z.string().transform((str) => new Date(str)),
    // Make mood a union of literal strings for better type safety
    mood: z.enum(moodTypes),
  });

export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type MoodEntry = typeof moodEntries.$inferSelect;

// Schema for monthly summaries
export const moodSummarySchema = z.object({
  month: z.string(), // e.g., "2023-10"
  counts: z.record(z.enum(moodTypes), z.number()),
  total: z.number(),
  percentages: z.record(z.enum(moodTypes), z.number()),
});

export type MoodSummary = z.infer<typeof moodSummarySchema>;
