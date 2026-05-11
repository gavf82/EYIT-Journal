import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import { initStore } from "@/lib/store";

// Pages
import HomePage from "@/pages/home";
import ChildJournal from "@/pages/child-journal";
import SummaryPage from "@/pages/summary";
import AssessmentPage from "@/pages/assessment";
import SettingsPage from "@/pages/settings";
import ContactPage from "@/pages/contact";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/child/:id" component={ChildJournal} />
        <Route path="/child/:id/summary" component={SummaryPage} />
        <Route path="/child/:id/assessment" component={AssessmentPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/contact" component={ContactPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initStore()
      .then(() => setReady(true))
      .catch(e => {
        console.error("[EYIT] Store init failed:", e);
        setReady(true); // render anyway; IDB errors shouldn't block the UI
      });
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading journal…</div>
      </div>
    );
  }

  return (
    <WouterRouter base={basePath}>
      <TooltipProvider>
        <Router />
        <div className="no-print"><Toaster /></div>
      </TooltipProvider>
    </WouterRouter>
  );
}

export default App;
