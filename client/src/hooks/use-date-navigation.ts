import { useState } from "react";
import { add, startOfMonth, endOfMonth, isToday, isSameMonth } from "date-fns";

export function useDateNavigation() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Go to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => add(prevDate, { months: -1 }));
  };

  // Go to next month
  const goToNextMonth = () => {
    setCurrentDate(prevDate => add(prevDate, { months: 1 }));
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format helpers
  const isCurrentMonth = (date: Date) => isSameMonth(date, currentDate);
  const dateIsToday = (date: Date) => isToday(date);
  
  // Get the first day of the month
  const startOfCurrentMonth = startOfMonth(currentDate);
  
  // Get the last day of the month
  const endOfCurrentMonth = endOfMonth(currentDate);

  return {
    currentDate,
    setCurrentDate,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    isCurrentMonth,
    dateIsToday,
    startOfCurrentMonth,
    endOfCurrentMonth,
  };
}
