import { Status } from "../data/journal";
import { STATUS_LABELS } from "../lib/progress";
import { cn } from "../lib/utils";
import { X } from "lucide-react";

interface Props {
  value: Status;
  onChange: (next: Status) => void;
  size?: "sm" | "md";
}

const order: Exclude<Status, null>[] = ["emerging", "developing", "secure"];

const baseClasses =
  "flex-1 inline-flex items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors select-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background";

const styles: Record<Exclude<Status, null>, { active: string; idle: string }> = {
  emerging: {
    active:
      "border-[hsl(var(--status-emerging))] bg-[hsl(var(--status-emerging)/0.18)] text-[hsl(35_70%_30%)]",
    idle: "border-border bg-card text-muted-foreground hover:bg-[hsl(var(--status-emerging)/0.08)] hover:text-[hsl(35_70%_30%)] hover:border-[hsl(var(--status-emerging)/0.6)]",
  },
  developing: {
    active:
      "border-[hsl(var(--status-developing))] bg-[hsl(var(--status-developing)/0.18)] text-[hsl(175_45%_22%)]",
    idle: "border-border bg-card text-muted-foreground hover:bg-[hsl(var(--status-developing)/0.08)] hover:text-[hsl(175_45%_22%)] hover:border-[hsl(var(--status-developing)/0.6)]",
  },
  secure: {
    active:
      "border-[hsl(var(--status-secure))] bg-[hsl(var(--status-secure)/0.2)] text-[hsl(135_45%_22%)]",
    idle: "border-border bg-card text-muted-foreground hover:bg-[hsl(var(--status-secure)/0.08)] hover:text-[hsl(135_45%_22%)] hover:border-[hsl(var(--status-secure)/0.6)]",
  },
};

export function StatusSelector({ value, onChange, size = "md" }: Props) {
  const padding = size === "sm" ? "px-2 py-1" : "px-2.5 py-1.5";
  return (
    <div className="flex items-center gap-1.5 w-full">
      <div className="flex flex-1 gap-1">
        {order.map((s) => {
          const active = value === s;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? null : s)}
              className={cn(baseClasses, padding, active ? styles[s].active : styles[s].idle)}
              data-testid={`status-${s}`}
            >
              {STATUS_LABELS[s]}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        aria-label="Clear rating"
        title="Clear rating"
        onClick={() => onChange(null)}
        disabled={value === null}
        className={cn(
          "shrink-0 inline-flex items-center justify-center rounded-md border border-border text-muted-foreground transition-colors",
          "hover:bg-muted hover:text-foreground",
          "disabled:opacity-30 disabled:cursor-not-allowed",
          size === "sm" ? "h-7 w-7" : "h-8 w-8",
        )}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
