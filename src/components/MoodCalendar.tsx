
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Smile, Meh, Frown } from "lucide-react";

type Mood = "happy" | "neutral" | "sad";

interface MoodData {
  [date: string]: Mood;
}

const MoodCalendar = () => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [moods, setMoods] = React.useState<MoodData>({});

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleMoodSelect = (mood: Mood) => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    setMoods(prev => ({ ...prev, [dateStr]: mood }));
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-[#9b87f5]/10 to-[#E5DEFF]/30">
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="rounded-md border w-full"
          modifiers={{
            booked: Object.keys(moods).map(date => new Date(date)),
          }}
          modifiersStyles={{
            booked: {
              fontWeight: "bold",
              color: "#6E59A5"
            }
          }}
        />
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">How are you feeling today?</h3>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleMoodSelect("happy")}
              className="p-3 rounded-full hover:bg-[#9b87f5]/20 transition-colors"
            >
              <Smile className="w-8 h-8 text-[#9b87f5]" />
            </button>
            <button
              onClick={() => handleMoodSelect("neutral")}
              className="p-3 rounded-full hover:bg-[#9b87f5]/20 transition-colors"
            >
              <Meh className="w-8 h-8 text-[#9b87f5]" />
            </button>
            <button
              onClick={() => handleMoodSelect("sad")}
              className="p-3 rounded-full hover:bg-[#9b87f5]/20 transition-colors"
            >
              <Frown className="w-8 h-8 text-[#9b87f5]" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MoodCalendar;
