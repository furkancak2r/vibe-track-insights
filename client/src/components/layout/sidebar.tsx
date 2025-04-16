import { Link } from "wouter";
import { MoodSummary } from "@/components/mood/mood-summary";
import { useQuery } from "@tanstack/react-query";
import { MoodSummary as MoodSummaryType } from "@shared/schema";
import { format } from "date-fns";
import { 
  FaCalendarAlt, 
  FaChartBar, 
  FaSlidersH,
  FaChartLine
} from "react-icons/fa";

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  const today = new Date();
  const monthYear = format(today, "yyyy-MM");

  // Modified to use test endpoint with sample data
  const { data: summaryData, isError } = useQuery<MoodSummaryType>({
    queryKey: [`/api/test-summary`], 
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <div className="bg-white shadow-md md:w-64 md:min-h-screen flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-indigo-600 flex items-center">
          <FaChartLine className="mr-2" />
          MoodTracker
        </h1>
      </div>

      <nav className="p-4 flex md:flex-col md:space-y-1 overflow-x-auto md:overflow-x-visible whitespace-nowrap">
        <Link href="/" className={`flex items-center p-2 rounded-md ${currentPath === "/" ? "bg-indigo-50 text-indigo-600 font-medium" : "text-slate-600 hover:bg-slate-100"}`}>
          <FaCalendarAlt className="mr-2" />
          <span>Calendar</span>
        </Link>
        <Link href="/analytics" className={`flex items-center p-2 rounded-md ${currentPath === "/analytics" ? "bg-indigo-50 text-indigo-600 font-medium" : "text-slate-600 hover:bg-slate-100"}`}>
          <FaChartBar className="mr-2" />
          <span>Analytics</span>
        </Link>
        <Link href="/settings" className={`flex items-center p-2 rounded-md ${currentPath === "/settings" ? "bg-indigo-50 text-indigo-600 font-medium" : "text-slate-600 hover:bg-slate-100"}`}>
          <FaSlidersH className="mr-2" />
          <span>Settings</span>
        </Link>
      </nav>

      {/* Monthly Summary Card (Desktop) */}
      <div className="hidden md:block mt-auto p-4 bg-white border-t border-slate-200">
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="font-medium text-slate-700 mb-2">{format(today, "MMMM yyyy")}</h3>
          {summaryData ? (
            <MoodSummary summary={summaryData} />
          ) : (
            <div className="text-sm text-slate-500">No mood data for this month yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
