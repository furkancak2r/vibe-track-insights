
import MoodCalendar from "@/components/MoodCalendar";
import MoodAnalytics from "@/components/MoodAnalytics";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-[#6E59A5] mb-2">Mood Tracker</h1>
          <p className="text-muted-foreground">Track and visualize your daily emotional journey</p>
        </header>
        
        <main className="space-y-8">
          <MoodCalendar />
          <MoodAnalytics />
        </main>
      </div>
    </div>
  );
};

export default Index;
