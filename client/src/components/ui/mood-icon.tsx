import { MoodType } from "@shared/schema";
import { 
  FaAngry,
  FaFrown,
  FaMeh,
  FaSmile,
  FaLaughBeam
} from "react-icons/fa";

interface MoodIconProps {
  mood: MoodType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MoodIcon({ mood, size = "md", className = "" }: MoodIconProps) {
  const moodStyles: Record<MoodType, string> = {
    terrible: "text-white bg-[#ef4444]", // red-500
    bad: "text-white bg-[#fb923c]", // orange-400
    neutral: "text-white bg-[#a1a1aa]", // zinc-400
    good: "text-white bg-[#a3e635]", // lime-400
    great: "text-white bg-[#10b981]", // emerald-500
  };

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-base",
    lg: "w-12 h-12 text-xl"
  };

  // Return appropriate icon based on mood
  const IconComponent = {
    terrible: FaAngry,
    bad: FaFrown,
    neutral: FaMeh,
    good: FaSmile,
    great: FaLaughBeam
  }[mood];

  return (
    <div className={`rounded-full flex items-center justify-center ${moodStyles[mood]} ${sizeClasses[size]} ${className}`}>
      <IconComponent />
    </div>
  );
}
