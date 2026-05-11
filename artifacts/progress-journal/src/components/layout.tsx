import React from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, Settings, Home, Mail, Download, CheckCircle2 } from "lucide-react";
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
            <div className="flex items-center gap-2 ml-1 sm:ml-2">
              {hasData && (
                <span className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 select-none">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Saved
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={!hasData}
                onClick={openDialog}
                data-testid="button-save-and-close"
                title="Export backup file"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Backup</span>
              </Button>
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
