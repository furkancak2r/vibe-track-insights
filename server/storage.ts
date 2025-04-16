import { users, type User, type InsertUser, type MoodEntry, type InsertMoodEntry } from "@shared/schema";
import { format } from "date-fns";
import { firebaseStorage } from "./services/firebase-service";

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Mood entry methods
  getMoodEntry(id: number): Promise<MoodEntry | undefined>;
  getAllMoodEntries(): Promise<MoodEntry[]>;
  getMoodEntriesByMonth(yearMonth: string): Promise<MoodEntry[]>;
  getMoodEntriesByDateRange(startDate: Date, endDate: Date): Promise<MoodEntry[]>;
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  updateMoodEntry(id: number, entry: InsertMoodEntry): Promise<MoodEntry | undefined>;
  deleteMoodEntry(id: number): Promise<boolean>;
  resetMoodEntries(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private moodEntries: Map<number, MoodEntry>;
  private userCurrentId: number;
  private moodEntryCurrentId: number;

  constructor() {
    this.users = new Map();
    this.moodEntries = new Map();
    this.userCurrentId = 1;
    this.moodEntryCurrentId = 1;
    
    // Add a default user
    this.createUser({ username: "demo", password: "password" });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Mood entry methods
  async getMoodEntry(id: number): Promise<MoodEntry | undefined> {
    return this.moodEntries.get(id);
  }
  
  async getAllMoodEntries(): Promise<MoodEntry[]> {
    return Array.from(this.moodEntries.values());
  }
  
  async getMoodEntriesByMonth(yearMonth: string): Promise<MoodEntry[]> {
    return Array.from(this.moodEntries.values()).filter(entry => {
      const entryDate = new Date(entry.date);
      const entryYearMonth = format(entryDate, "yyyy-MM");
      return entryYearMonth === yearMonth;
    });
  }
  
  async getMoodEntriesByDateRange(startDate: Date, endDate: Date): Promise<MoodEntry[]> {
    return Array.from(this.moodEntries.values()).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }
  
  async createMoodEntry(insertEntry: InsertMoodEntry): Promise<MoodEntry> {
    const id = this.moodEntryCurrentId++;
    
    // Check if an entry already exists for this date & user
    const entryDate = new Date(insertEntry.date);
    const existingEntry = Array.from(this.moodEntries.values()).find(entry => {
      const date = new Date(entry.date);
      return (
        entry.userId === insertEntry.userId &&
        date.getFullYear() === entryDate.getFullYear() &&
        date.getMonth() === entryDate.getMonth() &&
        date.getDate() === entryDate.getDate()
      );
    });
    
    // If an entry exists, update it instead
    if (existingEntry) {
      return this.updateMoodEntry(existingEntry.id, insertEntry) as Promise<MoodEntry>;
    }
    
    // Otherwise create a new entry
    const entry: MoodEntry = { 
      ...insertEntry, 
      id,
      notes: insertEntry.notes || null,
      factors: insertEntry.factors || null
    };
    this.moodEntries.set(id, entry);
    return entry;
  }
  
  async updateMoodEntry(id: number, insertEntry: InsertMoodEntry): Promise<MoodEntry | undefined> {
    const existingEntry = this.moodEntries.get(id);
    
    if (!existingEntry) {
      return undefined;
    }
    
    const updatedEntry: MoodEntry = { 
      ...insertEntry, 
      id,
      notes: insertEntry.notes || null,
      factors: insertEntry.factors || null
    };
    this.moodEntries.set(id, updatedEntry);
    return updatedEntry;
  }
  
  async deleteMoodEntry(id: number): Promise<boolean> {
    if (!this.moodEntries.has(id)) {
      return false;
    }
    
    return this.moodEntries.delete(id);
  }
  
  async resetMoodEntries(): Promise<void> {
    this.moodEntries.clear();
    this.moodEntryCurrentId = 1;
  }
}

// Determine which storage implementation to use
// For testing purposes, let's use Firebase
const useFirebase = true; // Set to true to use Firebase, false to use in-memory storage 
console.log(`Using ${useFirebase ? 'Firebase' : 'In-Memory'} storage`);

// Export the appropriate storage implementation
export const storage = useFirebase ? firebaseStorage : new MemStorage();
