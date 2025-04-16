import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  Timestamp,
  orderBy,
  limit
} from "firebase/firestore";
import { MoodEntry, InsertMoodEntry, User, InsertUser } from "@shared/schema";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtYFl5ex5Uk7pUvc79ZwdLLB3rYL2ZnDo",
  authDomain: "moodtracker-87d7c.firebaseapp.com",
  projectId: "moodtracker-87d7c",
  storageBucket: "moodtracker-87d7c.firebasestorage.app",
  messagingSenderId: "780557835548",
  appId: "1:780557835548:web:37ca9812c72c38ad7f6ed9",
  measurementId: "G-X4FYKNB3EX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection references
const USERS_COLLECTION = 'users';
const MOOD_ENTRIES_COLLECTION = 'mood_entries';

// Convert Firestore document to MoodEntry
function convertToMoodEntry(id: string, data: any): MoodEntry {
  return {
    id: parseInt(id),
    userId: data.userId,
    date: data.date.toDate(),
    mood: data.mood,
    notes: data.notes || undefined,
    factors: data.factors || undefined
  };
}

// Convert Firestore document to User
function convertToUser(id: string, data: any): User {
  return {
    id: parseInt(id),
    username: data.username,
    password: data.password
  };
}

export const firebaseStorage = {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const userRef = doc(db, USERS_COLLECTION, id.toString());
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return convertToUser(userDoc.id, userDoc.data());
      }
      
      return undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  },

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, where("username", "==", username), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return convertToUser(userDoc.id, userDoc.data());
      }
      
      return undefined;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  },

  async createUser(user: InsertUser): Promise<User> {
    try {
      // Get the highest existing ID to generate the next one
      const usersRef = collection(db, USERS_COLLECTION);
      const querySnapshot = await getDocs(usersRef);
      
      let maxId = 0;
      querySnapshot.forEach((doc) => {
        const userId = parseInt(doc.id);
        if (!isNaN(userId) && userId > maxId) {
          maxId = userId;
        }
      });
      
      const newId = maxId + 1;
      
      // Add the new user
      await addDoc(collection(db, USERS_COLLECTION), {
        ...user,
        id: newId
      });
      
      return {
        id: newId,
        ...user
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  // Mood entry methods
  async getMoodEntry(id: number): Promise<MoodEntry | undefined> {
    try {
      const entryRef = doc(db, MOOD_ENTRIES_COLLECTION, id.toString());
      const entryDoc = await getDoc(entryRef);
      
      if (entryDoc.exists()) {
        return convertToMoodEntry(entryDoc.id, entryDoc.data());
      }
      
      return undefined;
    } catch (error) {
      console.error("Error getting mood entry:", error);
      return undefined;
    }
  },

  async getAllMoodEntries(): Promise<MoodEntry[]> {
    try {
      const entriesRef = collection(db, MOOD_ENTRIES_COLLECTION);
      const querySnapshot = await getDocs(entriesRef);
      
      const entries: MoodEntry[] = [];
      querySnapshot.forEach((doc) => {
        entries.push(convertToMoodEntry(doc.id, doc.data()));
      });
      
      return entries;
    } catch (error) {
      console.error("Error getting all mood entries:", error);
      return [];
    }
  },

  async getMoodEntriesByMonth(yearMonth: string): Promise<MoodEntry[]> {
    try {
      const [year, month] = yearMonth.split('-').map(Number);
      
      // Create date range for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month
      
      const entriesRef = collection(db, MOOD_ENTRIES_COLLECTION);
      const q = query(
        entriesRef,
        where("date", ">=", Timestamp.fromDate(startDate)),
        where("date", "<=", Timestamp.fromDate(endDate)),
        orderBy("date", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      
      const entries: MoodEntry[] = [];
      querySnapshot.forEach((doc) => {
        entries.push(convertToMoodEntry(doc.id, doc.data()));
      });
      
      return entries;
    } catch (error) {
      console.error("Error getting mood entries by month:", error);
      return [];
    }
  },

  async getMoodEntriesByDateRange(startDate: Date, endDate: Date): Promise<MoodEntry[]> {
    try {
      const entriesRef = collection(db, MOOD_ENTRIES_COLLECTION);
      const q = query(
        entriesRef,
        where("date", ">=", Timestamp.fromDate(startDate)),
        where("date", "<=", Timestamp.fromDate(endDate)),
        orderBy("date", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      
      const entries: MoodEntry[] = [];
      querySnapshot.forEach((doc) => {
        entries.push(convertToMoodEntry(doc.id, doc.data()));
      });
      
      return entries;
    } catch (error) {
      console.error("Error getting mood entries by date range:", error);
      return [];
    }
  },

  async createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry> {
    try {
      // Get the highest existing ID to generate the next one
      const entriesRef = collection(db, MOOD_ENTRIES_COLLECTION);
      const querySnapshot = await getDocs(entriesRef);
      
      let maxId = 0;
      querySnapshot.forEach((doc) => {
        const entryId = parseInt(doc.id);
        if (!isNaN(entryId) && entryId > maxId) {
          maxId = entryId;
        }
      });
      
      const newId = maxId + 1;
      
      // Convert date to Firestore Timestamp
      let entryDate: Date;
      if (typeof entry.date === 'string') {
        entryDate = new Date(entry.date);
      } else {
        entryDate = entry.date;
      }
      
      // Create document data
      const docData = {
        userId: entry.userId,
        date: Timestamp.fromDate(entryDate),
        mood: entry.mood,
        notes: entry.notes || null,
        factors: entry.factors || null
      };
      
      // Add the new entry
      const docRef = doc(db, MOOD_ENTRIES_COLLECTION, newId.toString());
      await setDoc(docRef, docData);
      
      return {
        id: newId,
        userId: entry.userId,
        date: entryDate,
        mood: entry.mood,
        notes: entry.notes || null,
        factors: entry.factors || null
      };
    } catch (error) {
      console.error("Error creating mood entry:", error);
      throw error;
    }
  },

  async updateMoodEntry(id: number, entry: InsertMoodEntry): Promise<MoodEntry | undefined> {
    try {
      const entryRef = doc(db, MOOD_ENTRIES_COLLECTION, id.toString());
      const entryDoc = await getDoc(entryRef);
      
      if (!entryDoc.exists()) {
        return undefined;
      }
      
      // Convert date string to Firestore Timestamp
      const entryDate = new Date(entry.date);
      
      // Update the entry
      await updateDoc(entryRef, {
        ...entry,
        date: Timestamp.fromDate(entryDate)
      });
      
      return {
        id,
        userId: entry.userId,
        date: entryDate,
        mood: entry.mood,
        notes: entry.notes || null,
        factors: entry.factors || null
      };
    } catch (error) {
      console.error("Error updating mood entry:", error);
      return undefined;
    }
  },

  async deleteMoodEntry(id: number): Promise<boolean> {
    try {
      const entryRef = doc(db, MOOD_ENTRIES_COLLECTION, id.toString());
      const entryDoc = await getDoc(entryRef);
      
      if (!entryDoc.exists()) {
        return false;
      }
      
      await deleteDoc(entryRef);
      return true;
    } catch (error) {
      console.error("Error deleting mood entry:", error);
      return false;
    }
  },

  async resetMoodEntries(): Promise<void> {
    try {
      const entriesRef = collection(db, MOOD_ENTRIES_COLLECTION);
      const querySnapshot = await getDocs(entriesRef);
      
      // Delete all entries
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error resetting mood entries:", error);
      throw error;
    }
  }
};