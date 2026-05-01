import React from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, Settings, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSaveAndClose } from "../hooks/use-save-and-close";
import { SaveAndCloseDialog } from "./save-and-close-dialog";

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
          <nav className="flex items-center gap-2 sm:gap-4 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-foreground/80 ${location === "/" ? "text-foreground" : "text-foreground/60"}`}
            >
              <span className="flex items-center gap-1.5"><Home className="w-4 h-4"/> Home</span>
            </Link>
            <Link
              href="/settings"
              className={`transition-colors hover:text-foreground/80 ${location === "/settings" ? "text-foreground" : "text-foreground/60"}`}
            >
              <span className="flex items-center gap-1.5"><Settings className="w-4 h-4"/> Settings</span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 ml-2"
              disabled={!hasData}
              onClick={openDialog}
              data-testid="button-save-and-close"
            >
              <LogOut className="h-4 w-4" /> Save
            </Button>
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
