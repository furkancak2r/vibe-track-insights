
import { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa";
import { MoodCalendar } from "@/components/mood/mood-calendar";
import { MoodEntryDialog } from "@/components/mood/mood-entry-dialog";
import { MoodSummary } from "@/components/mood/mood-summary";
import { Button } from "@/components/ui/button";
import { useDateNavigation } from "@/hooks/use-date-navigation";
import { useQuery } from "@tanstack/react-query";
import { MoodSummary as MoodSummaryType, MoodEntry } from "@shared/schema";
import { format } from "date-fns";

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const {
    currentDate,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
  } = useDateNavigation();
  
  const monthYearStr = format(currentDate, "MMMM yyyy");
  const monthKey = format(currentDate, "yyyy-MM");
  
  // Get all mood entries for the current month
  const { data: moodEntries } = useQuery<MoodEntry[]>({
    queryKey: ["/api/moods", monthKey],
  });
  
  // Get summary for the month
  const { data: summary } = useQuery<MoodSummaryType>({
    queryKey: [`/api/moods/summary/${monthKey}`],
  });

  // Get the existing entry for the selected date if any
  const existingEntry = selectedDate && moodEntries 
    ? moodEntries.find(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getDate() === selectedDate.getDate() && 
               entryDate.getMonth() === selectedDate.getMonth() &&
               entryDate.getFullYear() === selectedDate.getFullYear();
      })
    : undefined;
  
  // Convert null values to undefined to match the expected types
  const formattedExistingEntry = existingEntry 
    ? {
        id: existingEntry.id,
        mood: existingEntry.mood,
        notes: existingEntry.notes === null ? undefined : existingEntry.notes,
        factors: existingEntry.factors === null ? undefined : existingEntry.factors
      }
    : undefined;
  
  const handleAddMood = () => {
    setSelectedDate(new Date());
    setDialogOpen(true);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setDialogOpen(true);
  };

  return (
    <>
      {/* Header with date selector */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="container mx-auto flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goToPreviousMonth}
            >
              <FaChevronLeft className="text-slate-600" />
            </Button>
            <h2 className="text-lg font-semibold">{monthYearStr}</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goToNextMonth}
            >
              <FaChevronRight className="text-slate-600" />
            </Button>
            <Button 
              variant="link" 
              onClick={goToToday}
              className="ml-2 text-indigo-600"
            >
              Today
            </Button>
          </div>
          <div className="mt-3 sm:mt-0 flex items-center space-x-2">
            <Button onClick={handleAddMood}>
              <FaPlus className="mr-2" /> 
              <span>Add Mood</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Calendar */}
        <MoodCalendar 
          currentDate={currentDate} 
          onSelectDate={handleSelectDate} 
        />

        {/* Monthly Statistics (Mobile Only) */}
        {summary && (
          <div className="md:hidden mt-6 bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-slate-700 mb-3">{monthYearStr} Summary</h3>
            <MoodSummary summary={summary} />
          </div>
        )}
      </main>

      {/* Mood Entry Dialog */}
      {selectedDate && (
        <MoodEntryDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          selectedDate={selectedDate}
          existingEntry={formattedExistingEntry}
        />
      )}
    </>
  );
}
