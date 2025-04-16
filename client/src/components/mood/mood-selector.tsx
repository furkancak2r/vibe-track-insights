import { MoodType } from "@shared/schema";
import { MoodIcon } from "@/components/ui/mood-icon";

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onSelectMood: (mood: MoodType) => void;
}

export function MoodSelector({ selectedMood, onSelectMood }: MoodSelectorProps) {
  const moods: { type: MoodType; label: string }[] = [
    { type: "terrible", label: "Awful" },
    { type: "bad", label: "Bad" },
    { type: "neutral", label: "Okay" },
    { type: "good", label: "Good" },
    { type: "great", label: "Great" },
  ];

  return (
    <div className="flex justify-between items-center w-full">
      {moods.map(mood => (
        <button
          key={mood.type}
          onClick={() => onSelectMood(mood.type)}
          className={`flex flex-col items-center p-2 rounded-lg ${
            selectedMood === mood.type ? "bg-slate-100" : "hover:bg-slate-100"
          }`}
        >
          <MoodIcon mood={mood.type} size="lg" className="mb-1" />
          <span className="text-xs font-medium">{mood.label}</span>
        </button>
      ))}
    </div>
  );
}
