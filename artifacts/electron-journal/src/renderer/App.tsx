import { Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

// Pages – most come from progress-journal/src via alias; settings is overridden
import HomePage from "@/pages/home";
import ChildJournal from "@/pages/child-journal";
import SummaryPage from "@/pages/summary";
import AssessmentPage from "@/pages/assessment";
import SettingsPage from "@/pages/settings"; // aliased → settings-desktop.tsx

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/child/:id" component={ChildJournal} />
        <Route path="/child/:id/summary" component={SummaryPage} />
        <Route path="/child/:id/assessment" component={AssessmentPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default function App() {
  // Hash-based routing works with Electron's file:// protocol
  return (
    <WouterRouter hook={useHashLocation}>
      <TooltipProvider>
        <Router />
        <div className="no-print">
          <Toaster />
        </div>
      </TooltipProvider>
    </WouterRouter>
  );
}
