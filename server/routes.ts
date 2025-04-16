import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { format, parse, isValid } from "date-fns";
import { insertMoodEntrySchema, MoodSummary, MoodType, moodTypes } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { getActivitySuggestions } from "./services/ai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Test endpoint that always returns a valid MoodSummary object
  app.get("/api/test-summary", (_req, res) => {
    const testSummary: MoodSummary = {
      month: "2025-04",
      counts: {
        great: 5,
        good: 10,
        neutral: 3,
        bad: 2,
        terrible: 0
      },
      total: 20,
      percentages: {
        great: 25,
        good: 50,
        neutral: 15,
        bad: 10,
        terrible: 0
      }
    };
    console.log("Returning TEST summary:", testSummary);
    res.json(testSummary);
  });
  
  // Get activity suggestions based on mood
  app.get("/api/suggestions/:mood", async (req, res) => {
    try {
      const { mood } = req.params;
      const { notes } = req.query;
      
      // Validate mood
      if (!moodTypes.includes(mood as MoodType)) {
        return res.status(400).json({ 
          message: `Invalid mood. Must be one of: ${moodTypes.join(", ")}` 
        });
      }
      
      // Get suggestions from Gemini API
      const suggestions = await getActivitySuggestions(
        mood as MoodType, 
        typeof notes === "string" ? notes : undefined
      );
      
      res.json(suggestions);
    } catch (error) {
      console.error("Error getting suggestions:", error);
      res.status(500).json({ message: "Failed to get activity suggestions" });
    }
  });
  
  // IMPORTANT: Register routes in order of specificity (most specific first)
  
  // Get monthly mood summary - MOST SPECIFIC ROUTE
  app.get("/api/moods/summary/:yearMonth", async (req, res) => {
    console.log("GET summary for yearMonth:", req.params.yearMonth);
    
    const { yearMonth } = req.params;
    
    if (!yearMonth.match(/^\d{4}-\d{2}$/)) {
      console.log("Invalid format:", yearMonth);
      return res.status(400).json({ message: "Invalid format. Use YYYY-MM" });
    }
    
    try {
      // Initialize empty mood counts and percentages with default values for all mood types
      const emptyCounts: Record<MoodType, number> = moodTypes.reduce((acc, mood) => {
        acc[mood] = 0;
        return acc;
      }, {} as Record<MoodType, number>);
      
      const emptyPercentages: Record<MoodType, number> = moodTypes.reduce((acc, mood) => {
        acc[mood] = 0;
        return acc;
      }, {} as Record<MoodType, number>);
      
      let entries: any[] = [];
      try {
        entries = await storage.getMoodEntriesByMonth(yearMonth);
        console.log("Found entries:", entries.length);
      } catch (err) {
        console.error("Error fetching entries:", err);
        entries = [];
      }
      
      // If no entries for the month, return empty summary with proper structure
      if (!entries || entries.length === 0) {
        console.log("No entries, returning empty summary");
        const emptySummary: MoodSummary = {
          month: yearMonth,
          counts: emptyCounts,
          total: 0,
          percentages: emptyPercentages
        };
        console.log("Empty summary object:", JSON.stringify(emptySummary));
        return res.json(emptySummary);
      }
      
      // Count moods
      const counts = { ...emptyCounts };
      entries.forEach(entry => {
        const mood = entry.mood as MoodType;
        counts[mood] = (counts[mood] || 0) + 1;
      });
      
      // Calculate percentages
      const total = entries.length;
      const percentages = { ...emptyPercentages };
      
      Object.entries(counts).forEach(([mood, count]) => {
        if (count > 0) {
          percentages[mood as MoodType] = Math.round((count / total) * 100);
        }
      });
      
      const summary: MoodSummary = {
        month: yearMonth,
        counts,
        total,
        percentages
      };
      
      console.log("Returning summary object:", JSON.stringify(summary));
      return res.json(summary);
    } catch (error) {
      console.error("Error in mood summary:", error);
      
      // Always return a valid MoodSummary object with the expected structure
      const errorSummary: MoodSummary = {
        month: yearMonth,
        counts: moodTypes.reduce((acc, mood) => {
          acc[mood] = 0;
          return acc;
        }, {} as Record<MoodType, number>),
        total: 0,
        percentages: moodTypes.reduce((acc, mood) => {
          acc[mood] = 0;
          return acc;
        }, {} as Record<MoodType, number>)
      };
      
      console.log("Returning error summary object:", JSON.stringify(errorSummary));
      return res.json(errorSummary);
    }
  });

  // Get mood entries by month - SPECIFIC ROUTE WITH TWO PARAMS
  app.get("/api/moods/:year/:month", async (req, res) => {
    try {
      const { year, month } = req.params;
      const monthStr = `${year}-${month.padStart(2, "0")}`;
      const entries = await storage.getMoodEntriesByMonth(monthStr);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get mood entries" });
    }
  });

  // Get all mood entries - LESS SPECIFIC ROUTE
  app.get("/api/moods", async (req, res) => {
    try {
      const entries = await storage.getAllMoodEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get mood entries" });
    }
  });

  // Get a single mood entry by ID - MUST COME AFTER MORE SPECIFIC ROUTES
  app.get("/api/moods/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if this is actually looking for a summary path
      if (id === "summary") {
        return res.status(400).json({ message: "Invalid request. Use /api/moods/summary/YYYY-MM format." });
      }
      
      const entry = await storage.getMoodEntry(parseInt(id));
      
      if (!entry) {
        return res.status(404).json({ message: "Mood entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to get mood entry" });
    }
  });

  // Create a mood entry
  app.post("/api/moods", async (req, res) => {
    try {
      const data = insertMoodEntrySchema.parse(req.body);
      const newEntry = await storage.createMoodEntry(data);
      res.status(201).json(newEntry);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to create mood entry" });
      }
    }
  });

  // Update a mood entry
  app.put("/api/moods/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertMoodEntrySchema.parse(req.body);
      const updatedEntry = await storage.updateMoodEntry(parseInt(id), data);
      
      if (!updatedEntry) {
        return res.status(404).json({ message: "Mood entry not found" });
      }
      
      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to update mood entry" });
      }
    }
  });

  // Delete a mood entry
  app.delete("/api/moods/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteMoodEntry(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: "Mood entry not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete mood entry" });
    }
  });

  // Reset all mood data (for testing/development)
  app.delete("/api/moods/reset", async (req, res) => {
    try {
      await storage.resetMoodEntries();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset mood entries" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
