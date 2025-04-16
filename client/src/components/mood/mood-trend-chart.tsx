import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoodEntry, MoodType } from "@shared/schema";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend,
  Dot
} from "recharts";
import { format, subDays, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";

// Convert mood to numeric value for chart (1-5)
const moodToValue = (mood: MoodType): number => {
  const values: Record<MoodType, number> = {
    terrible: 1,
    bad: 2,
    neutral: 3,
    good: 4,
    great: 5,
  };
  return values[mood];
};

// Convert numeric value back to mood type
const valueToMood = (value: number): MoodType => {
  const moods: Record<number, MoodType> = {
    1: "terrible",
    2: "bad",
    3: "neutral",
    4: "good",
    5: "great",
  };
  return moods[Math.round(value)];
};

interface MoodTrendChartProps {
  dateFrom?: Date;
  dateTo?: Date;
}

interface ChartPoint {
  date: string;
  value: number;
  mood: MoodType;
  formattedDate: string;
}

export function MoodTrendChart({ dateFrom, dateTo }: MoodTrendChartProps) {
  const [period, setPeriod] = useState<"30d" | "90d" | "year">("30d");
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  
  const today = new Date();
  const startDate = dateFrom || (() => {
    if (period === "30d") return subDays(today, 30);
    if (period === "90d") return subDays(today, 90);
    return subDays(today, 365); // year
  })();
  
  const queryKey = ["/api/moods", format(startDate, "yyyy-MM-dd"), format(dateTo || today, "yyyy-MM-dd")];
  
  const { data: moodEntries } = useQuery<MoodEntry[]>({
    queryKey,
  });

  useEffect(() => {
    if (!moodEntries) return;

    // Convert mood entries to chart data
    const data: ChartPoint[] = moodEntries.map(entry => {
      const entryDate = new Date(entry.date);
      return {
        date: format(entryDate, "yyyy-MM-dd"),
        value: moodToValue(entry.mood as MoodType),
        mood: entry.mood as MoodType,
        formattedDate: format(entryDate, "MMM d"),
      };
    });

    // Sort by date
    data.sort((a, b) => a.date.localeCompare(b.date));
    
    setChartData(data);
  }, [moodEntries]);

  const handlePeriodChange = (newPeriod: "30d" | "90d" | "year") => {
    setPeriod(newPeriod);
  };

  // Custom dot for the chart
  const CustomizedDot = (props: any) => {
    const { cx, cy, value } = props;
    
    const colors: Record<number, string> = {
      1: "#ef4444", // terrible - red-500
      2: "#fb923c", // bad - orange-400
      3: "#a1a1aa", // neutral - zinc-400
      4: "#a3e635", // good - lime-400
      5: "#10b981", // great - emerald-500
    };
    
    return (
      <Dot cx={cx} cy={cy} r={5} fill={colors[value]} />
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-slate-700">
          Mood Trends ({differenceInDays(dateTo || today, startDate)} days)
        </h3>
        <div className="flex space-x-2">
          <Button 
            variant={period === "30d" ? "default" : "outline"} 
            size="sm"
            onClick={() => handlePeriodChange("30d")}
          >
            30 Days
          </Button>
          <Button 
            variant={period === "90d" ? "default" : "outline"} 
            size="sm"
            onClick={() => handlePeriodChange("90d")}
          >
            90 Days
          </Button>
          <Button 
            variant={period === "year" ? "default" : "outline"} 
            size="sm"
            onClick={() => handlePeriodChange("year")}
          >
            Year
          </Button>
        </div>
      </div>
      
      <div className="h-48 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 12 }} 
                tickFormatter={(tick) => tick}
                minTickGap={30}
              />
              <YAxis 
                domain={[1, 5]} 
                ticks={[1, 2, 3, 4, 5]} 
                tickFormatter={(value) => {
                  const labels = ["Awful", "Bad", "Okay", "Good", "Great"];
                  return labels[value - 1];
                }}
              />
              <Tooltip 
                formatter={(value: number) => {
                  const mood = valueToMood(value);
                  const moodLabels: Record<MoodType, string> = {
                    terrible: "Awful",
                    bad: "Bad",
                    neutral: "Okay",
                    good: "Good",
                    great: "Great",
                  };
                  return moodLabels[mood];
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#6366f1" 
                strokeWidth={2} 
                dot={<CustomizedDot />} 
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            No mood data available for the selected period
          </div>
        )}
      </div>
    </div>
  );
}
