import { useState, useEffect } from "react";
import { MoodIcon } from "@/components/ui/mood-icon";
import { useQuery } from "@tanstack/react-query";
import { MoodEntry, MoodType } from "@shared/schema";
import { add, format, startOfMonth, endOfMonth, getDay, isToday, isSameMonth, isSameDay } from "date-fns";
import { FaPlus } from "react-icons/fa";

interface MoodCalendarProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  mood?: MoodType;
  entryId?: number;
}

export function MoodCalendar({ currentDate, onSelectDate }: MoodCalendarProps) {
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  
  // Query mood entries for the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  const { data: moodEntries } = useQuery<MoodEntry[]>({
    queryKey: ["/api/moods", format(monthStart, "yyyy-MM")],
  });

  // Build calendar days
  useEffect(() => {
    const days: CalendarDay[] = [];
    
    // Calculate first day to display (may be from previous month)
    const firstDayOfMonth = startOfMonth(currentDate);
    const startDate = add(firstDayOfMonth, { days: -getDay(firstDayOfMonth) });
    
    // Create 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = add(startDate, { days: i });
      const isCurrentMonth = isSameMonth(date, currentDate);
      
      // Find mood entry for this day if it exists
      const moodEntry = moodEntries?.find(entry => 
        isSameDay(new Date(entry.date), date)
      );
      
      days.push({
        date,
        isCurrentMonth,
        mood: moodEntry?.mood as MoodType | undefined,
        entryId: moodEntry?.id,
      });
    }
    
    setCalendarDays(days);
  }, [currentDate, moodEntries]);

  // Split days into weeks
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }
  
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Days of week header */}
      <div className="grid grid-cols-7 bg-slate-100 text-slate-600 font-medium">
        {weekdays.map(day => (
          <div key={day} className="p-2 text-center border-r border-slate-200 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-t border-slate-200">
        {weeks.map((week, weekIndex) => (
          week.map((day, dayIndex) => (
            <div 
              key={`${weekIndex}-${dayIndex}`}
              className={`min-h-[100px] p-1 border-r border-b border-slate-200 last:border-r-0 ${
                !day.isCurrentMonth ? 'bg-slate-50' : ''
              } ${isToday(day.date) ? 'ring-2 ring-indigo-500' : ''}`}
              onClick={() => day.isCurrentMonth && onSelectDate(day.date)}
            >
              <div className={`text-sm p-1 ${
                !day.isCurrentMonth 
                  ? 'text-slate-400' 
                  : isToday(day.date) 
                    ? 'text-indigo-600 font-bold' 
                    : 'text-slate-600'
              }`}>
                {format(day.date, "d")}
              </div>
              
              {day.isCurrentMonth && (
                <div className="mt-2 mx-auto flex justify-center">
                  {day.mood ? (
                    <MoodIcon mood={day.mood} size="md" />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      <FaPlus size={12} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ))}
      </div>
    </div>
  );
}
