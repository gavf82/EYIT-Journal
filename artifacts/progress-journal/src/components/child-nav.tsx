import { Link, useLocation } from "wouter";
import { ArrowLeft, BarChart2, BookOpen, ClipboardList } from "lucide-react";
import { cn } from "../lib/utils";

const TABS = [
  {
    label: "Summary",
    icon: BarChart2,
    href: (id: string) => `/child/${id}/summary`,
  },
  {
    label: "Journal",
    icon: BookOpen,
    href: (id: string) => `/child/${id}`,
  },
  {
    label: "Assessment",
    icon: ClipboardList,
    href: (id: string) => `/child/${id}/assessment`,
  },
] as const;

export function ChildNav({ childId }: { childId: string }) {
  const [location] = useLocation();

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 no-print">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 shrink-0"
        data-testid="link-back-home"
      >
        <ArrowLeft className="h-4 w-4" /> All children
      </Link>

      <div className="h-4 w-px bg-border shrink-0" />

      <nav
        className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-1"
        aria-label="Child pages"
      >
        {TABS.map(({ label, icon: Icon, href }) => {
          const to = href(childId);
          const isActive = location === to;
          return (
            <Link
              key={label}
              href={to}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/60",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
