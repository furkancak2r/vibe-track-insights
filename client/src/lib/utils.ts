import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, formatString: string = "PPP"): string {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return format(date, formatString);
}

export function groupByMonth<T>(
  items: T[], 
  dateAccessor: (item: T) => Date | string
): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const date = dateAccessor(item);
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const monthKey = format(dateObj, "yyyy-MM");
    
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    
    acc[monthKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export function calculateMoodPercentages(
  moodCounts: Record<string, number>
): Record<string, number> {
  const total = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
  
  if (total === 0) return {};
  
  return Object.entries(moodCounts).reduce((acc, [mood, count]) => {
    acc[mood] = Math.round((count / total) * 100);
    return acc;
  }, {} as Record<string, number>);
}
