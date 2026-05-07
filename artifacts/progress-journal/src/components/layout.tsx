import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, Settings, Home, LogOut, AlertTriangle, Mail, Cloud, CloudOff, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSaveAndClose } from "../hooks/use-save-and-close";
import { SaveAndCloseDialog } from "./save-and-close-dialog";
import { getLastExportedAt } from "../lib/store";
import { useUser, useClerk, Show } from "@clerk/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

function AuthControl() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();

  if (!isLoaded) return null;

  return (
    <>
      <Show when="signed-out">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setLocation("/sign-in")}
                data-testid="button-sign-in"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs max-w-52 text-center">
              Sign in to save your data to the cloud and access it from any device.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Show>

      <Show when="signed-in">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5" data-testid="button-user-menu">
              <Cloud className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline max-w-[120px] truncate text-xs">
                {user?.primaryEmailAddress?.emailAddress ?? user?.fullName ?? "Account"}
              </span>
              <User className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium text-foreground truncate">
                {user?.fullName ?? user?.primaryEmailAddress?.emailAddress}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
              <p className="text-[10px] text-primary mt-0.5 flex items-center gap-1">
                <Cloud className="h-2.5 w-2.5" /> Cloud sync active
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ redirectUrl: window.location.origin + window.location.pathname.replace(/\/sign-.*/, "") })}
              className="gap-2 text-sm cursor-pointer"
              data-testid="button-sign-out"
            >
              <CloudOff className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Show>
    </>
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
            <Link
              href="/contact"
              className={`transition-colors hover:text-foreground/80 ${location === "/contact" ? "text-foreground" : "text-foreground/60"}`}
            >
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4"/> Contact</span>
            </Link>
            <Show when="signed-out">
              <div className="flex flex-col items-end gap-0.5 ml-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={!hasData}
                  onClick={openDialog}
                  data-testid="button-save-and-close"
                >
                  <LogOut className="h-4 w-4" /> Save
                </Button>
                <BackupIndicator />
              </div>
            </Show>
            <div className="ml-1">
              <AuthControl />
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
