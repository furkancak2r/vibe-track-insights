import { MoodSummary as MoodSummaryType, MoodType } from "@shared/schema";

interface MoodSummaryBarProps {
  mood: MoodType;
  percentage: number;
  label: string;
}

function MoodSummaryBar({ mood, percentage, label }: MoodSummaryBarProps) {
  const moodColors: Record<MoodType, string> = {
    great: "bg-[#10b981] text-[#10b981]", // emerald-500
    good: "bg-[#a3e635] text-[#a3e635]", // lime-400
    neutral: "bg-[#a1a1aa] text-[#a1a1aa]", // zinc-400
    bad: "bg-[#fb923c] text-[#fb923c]", // orange-400
    terrible: "bg-[#ef4444] text-[#ef4444]", // red-500
  };

  const textColor = moodColors[mood].split(" ")[1];
  const bgColor = moodColors[mood].split(" ")[0];

  return (
    <div className="flex items-center justify-between text-xs">
      <span className={`${textColor} font-medium`}>{label}</span>
      <div className="w-32 bg-slate-200 rounded-full h-2 ml-2">
        <div 
          className={`${bgColor} h-2 rounded-full`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="ml-2 text-slate-600">{percentage}%</span>
    </div>
  );
}

interface MoodSummaryProps {
  summary: MoodSummaryType | null | undefined | any[];
}

export function MoodSummary({ summary }: MoodSummaryProps) {
  const moodLabels: Record<MoodType, string> = {
    great: "Great",
    good: "Good",
    neutral: "Okay",
    bad: "Bad",
    terrible: "Awful",
  };

  // Order from great to terrible
  const moodOrder: MoodType[] = ["great", "good", "neutral", "bad", "terrible"];
  
  // Handle empty or invalid summary data
  const emptyPercentages: Record<MoodType, number> = {
    great: 0,
    good: 0,
    neutral: 0,
    bad: 0,
    terrible: 0
  };
  
  // Use empty percentages if summary is null, undefined, an empty array, or missing percentages
  const percentages = summary && 
                     !Array.isArray(summary) && 
                     summary.percentages ? summary.percentages : emptyPercentages;

  return (
    <div className="space-y-2">
      {moodOrder.map(mood => (
        <MoodSummaryBar
          key={mood}
          mood={mood}
          percentage={percentages[mood] || 0}
          label={moodLabels[mood]}
        />
      ))}
    </div>
  );
}
