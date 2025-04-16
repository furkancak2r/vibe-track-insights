import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { MoodType } from '@shared/schema';
import { MoodIcon } from '@/components/ui/mood-icon';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Define the ActivitySuggestion interface to match our API response
interface ActivitySuggestion {
  activities: string[];
  message: string;
}

interface MoodSuggestionsProps {
  mood: MoodType;
  notes?: string;
}

export function MoodSuggestions({ mood, notes }: MoodSuggestionsProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);

  // Query suggestions from our API
  const { data: suggestions, isLoading, isError } = useQuery<ActivitySuggestion>({
    queryKey: [`/api/suggestions/${mood}`, notes], 
    enabled: expanded, // Only fetch when expanded
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const handleExpandClick = () => {
    setExpanded(true);
  };

  if (!expanded) {
    return (
      <div className="mt-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2"
          onClick={handleExpandClick}
        >
          <MoodIcon mood={mood} size="sm" />
          <span>Get activity suggestions based on your mood</span>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-4 space-y-3 border rounded-lg p-4">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-3/4" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-6 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !suggestions) {
    return (
      <div className="mt-4 p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600 font-medium">Error loading suggestions</p>
        <p className="text-red-500 text-sm">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="mt-4 border rounded-lg p-4 bg-white">
      <div className="space-y-4">
        {/* Message */}
        <p className="text-slate-700 font-medium italic">{suggestions.message}</p>
        
        {/* Activity suggestions */}
        <div>
          <h4 className="text-sm font-medium text-slate-600 mb-2">Try these activities:</h4>
          <ul className="space-y-2">
            {suggestions.activities.map((activity, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-indigo-500">•</span>
                <span className="text-slate-700">{activity}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Footer with credits */}
        <div className="pt-2 border-t text-xs text-slate-500">
          <p>Suggestions powered by Google Gemini AI</p>
        </div>
      </div>
    </div>
  );
}