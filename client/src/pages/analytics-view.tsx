import { MoodTrendChart } from "@/components/mood/mood-trend-chart";
import { useQuery } from "@tanstack/react-query";
import { MoodEntry, MoodType } from "@shared/schema";
import { useState } from "react";
import { groupByMonth, calculateMoodPercentages } from "@/lib/utils";
import { format, subMonths } from "date-fns";
import { MoodSummary } from "@/components/mood/mood-summary";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsView() {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(format(today, "yyyy-MM"));
  
  // Get all mood entries
  const { data: moodEntries, isLoading } = useQuery<MoodEntry[]>({
    queryKey: ["/api/moods"],
  });

  // Group entries by month
  const entriesByMonth = moodEntries ? groupByMonth(moodEntries, entry => entry.date) : {};
  
  // Get available months (last 12 months)
  const availableMonths = [];
  for (let i = 0; i < 12; i++) {
    const monthDate = subMonths(today, i);
    const monthKey = format(monthDate, "yyyy-MM");
    const monthLabel = format(monthDate, "MMMM yyyy");
    availableMonths.push({ key: monthKey, label: monthLabel });
  }
  
  // Calculate summary for selected month
  const selectedMonthEntries = entriesByMonth[selectedMonth] || [];
  const moodCounts = selectedMonthEntries.reduce((acc, entry) => {
    const mood = entry.mood as MoodType;
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {} as Record<MoodType, number>);
  
  const moodPercentages = calculateMoodPercentages(moodCounts);
  const totalEntries = selectedMonthEntries.length;

  const monthSummary = {
    month: selectedMonth,
    counts: moodCounts,
    total: totalEntries,
    percentages: moodPercentages
  };

  // Calculate mood frequencies
  const moodFrequency = moodEntries?.reduce((acc, entry) => {
    const mood = entry.mood as MoodType;
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {} as Record<MoodType, number>);

  const moodLabels: Record<MoodType, string> = {
    great: "Great",
    good: "Good",
    neutral: "Okay",
    bad: "Bad",
    terrible: "Awful",
  };

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mood Analytics</h1>
        <p className="text-slate-600">Track your mood patterns and trends over time</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trend chart */}
        <div className="md:col-span-2">
          <MoodTrendChart />
        </div>

        {/* Monthly analysis */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Monthly Analysis</CardTitle>
              <Select
                value={selectedMonth}
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map(month => (
                    <SelectItem key={month.key} value={month.key}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">Loading...</div>
            ) : totalEntries > 0 ? (
              <>
                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-1">
                    {totalEntries} total mood entries for {format(new Date(`${selectedMonth}-01`), "MMMM yyyy")}
                  </p>
                </div>
                <MoodSummary summary={monthSummary} />
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">
                No mood data for this month
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overall mood distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Mood Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">Loading...</div>
            ) : moodEntries && moodEntries.length > 0 ? (
              <div>
                <p className="text-sm text-slate-600 mb-4">
                  Based on {moodEntries.length} total mood entries
                </p>
                <div className="space-y-4">
                  {(["great", "good", "neutral", "bad", "terrible"] as MoodType[]).map(mood => {
                    const count = moodFrequency?.[mood] || 0;
                    const percentage = moodEntries.length > 0 
                      ? Math.round((count / moodEntries.length) * 100) 
                      : 0;
                    
                    return (
                      <div key={mood} className="flex items-center">
                        <div className="w-24 text-sm font-medium" style={{ color: getMoodColor(mood) }}>
                          {moodLabels[mood]}
                        </div>
                        <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${percentage}%`, 
                              backgroundColor: getMoodColor(mood) 
                            }}
                          />
                        </div>
                        <div className="w-16 text-right text-sm text-slate-600">
                          {percentage}% ({count})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                No mood data recorded yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getMoodColor(mood: MoodType): string {
  const colors: Record<MoodType, string> = {
    great: "#10b981", // emerald-500
    good: "#a3e635",  // lime-400
    neutral: "#a1a1aa", // zinc-400
    bad: "#fb923c",   // orange-400
    terrible: "#ef4444", // red-500
  };
  return colors[mood];
}
