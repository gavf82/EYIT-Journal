import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, Settings, Home, AlertTriangle, Mail, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSaveAndClose } from "../hooks/use-save-and-close";
import { SaveAndCloseDialog } from "./save-and-close-dialog";
import { getLastExportedAt } from "../lib/store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function daysSince(isoDate: string): number {
  const ms = Date.now() - new Date(isoDate).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function BackupIndicator() {
  const [lastExported, setLastExported] = useState<string | null>(() =>
    getLastExportedAt()
  );

  useEffect(() => {
    const sync = () => setLastExported(getLastExportedAt());
    window.addEventListener("eyit-store-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("eyit-store-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!lastExported) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1 text-[10px] text-amber-500 font-medium cursor-default">
              <AlertTriangle className="h-3 w-3" /> No backup yet
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs max-w-52 text-center">
            Save your data to a .db file regularly so it isn't lost if the browser clears storage.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const days = daysSince(lastExported);

  if (days < 3) return null;

  const label =
    days === 0
      ? "Today"
      : days === 1
      ? "Yesterday"
      : `${days}d ago`;

  const urgent = days >= 7;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`flex items-center gap-1 text-[10px] font-medium cursor-default ${
              urgent ? "text-amber-500" : "text-muted-foreground"
            }`}
          >
            {urgent && <AlertTriangle className="h-3 w-3" />}
            Backed up {label}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs max-w-52 text-center">
          {urgent
            ? "It's been a while — consider saving a backup .db file."
            : `Last backup: ${new Date(lastExported).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { openDialog, hasData, dialogProps } = useSaveAndClose();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <BookOpen className="h-6 w-6" />
            <span className="font-semibold tracking-tight">EYIT Development Journal</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-4 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-foreground/80 p-1 sm:p-0 ${location === "/" ? "text-foreground" : "text-foreground/60"}`}
              title="Home"
            >
              <span className="flex items-center gap-1.5">
                <Home className="w-4 h-4 shrink-0"/>
                <span className="hidden sm:inline">Home</span>
              </span>
            </Link>
            <Link
              href="/settings"
              className={`transition-colors hover:text-foreground/80 p-1 sm:p-0 ${location === "/settings" ? "text-foreground" : "text-foreground/60"}`}
              title="Settings"
            >
              <span className="flex items-center gap-1.5">
                <Settings className="w-4 h-4 shrink-0"/>
                <span className="hidden sm:inline">Settings</span>
              </span>
            </Link>
            <Link
              href="/contact"
              className={`transition-colors hover:text-foreground/80 p-1 sm:p-0 ${location === "/contact" ? "text-foreground" : "text-foreground/60"}`}
              title="Contact"
            >
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 shrink-0"/>
                <span className="hidden sm:inline">Contact</span>
              </span>
            </Link>
            <div className="flex flex-col items-end gap-0.5 ml-1 sm:ml-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={!hasData}
                onClick={openDialog}
                data-testid="button-save-and-close"
                title="Save backup"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </Button>
              <BackupIndicator />
            </div>
            <SaveAndCloseDialog {...dialogProps} />
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t border-border/40 no-print">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Adapted from EYIT Development Journal, September 2024 — Early Years Inclusion Team / Leeds City Council.
          </p>
        </div>
      </footer>
    </div>
  );
}
