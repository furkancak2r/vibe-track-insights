import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import CalendarView from "@/pages/calendar-view";
import AnalyticsView from "@/pages/analytics-view";
import SettingsView from "@/pages/settings-view";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  const [location] = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar currentPath={location} />
      <div className="flex-1 overflow-auto">
        <Switch>
          <Route path="/" component={CalendarView} />
          <Route path="/analytics" component={AnalyticsView} />
          <Route path="/settings" component={SettingsView} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
