import { useState } from "react";
import { Status } from "../data/journal";
import { STATUS_LABELS } from "../lib/progress";
import { cn } from "../lib/utils";
import { X } from "lucide-react";
import { ConfirmDialog } from "./confirm-dialog";

interface Props {
  value: Status;
  onChange: (next: Status) => void;
  size?: "sm" | "md";
}

const progressOrder: Exclude<Status, null>[] = ["emerging", "developing", "secure"];

const baseClasses =
  "flex-1 inline-flex items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors select-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background";

const styles: Record<Exclude<Status, null>, { active: string; idle: string }> = {
  emerging: {
    active:
      "border-[hsl(var(--status-emerging))] bg-[hsl(var(--status-emerging)/0.18)] text-[hsl(5_60%_32%)]",
    idle: "border-border bg-card text-muted-foreground hover:bg-[hsl(var(--status-emerging)/0.08)] hover:text-[hsl(5_60%_32%)] hover:border-[hsl(var(--status-emerging)/0.6)]",
  },
  developing: {
    active:
      "border-[hsl(var(--status-developing))] bg-[hsl(var(--status-developing)/0.22)] text-[hsl(30_70%_28%)]",
    idle: "border-border bg-card text-muted-foreground hover:bg-[hsl(var(--status-developing)/0.10)] hover:text-[hsl(30_70%_28%)] hover:border-[hsl(var(--status-developing)/0.6)]",
  },
  secure: {
    active:
      "border-[hsl(var(--status-secure))] bg-[hsl(var(--status-secure)/0.2)] text-[hsl(130_55%_22%)]",
    idle: "border-border bg-card text-muted-foreground hover:bg-[hsl(var(--status-secure)/0.08)] hover:text-[hsl(130_55%_22%)] hover:border-[hsl(var(--status-secure)/0.6)]",
  },
};

type PendingAction =
  | { kind: "downgrade"; next: Exclude<Status, null> }
  | { kind: "remove" };

function buildDialogProps(
  pending: PendingAction,
  current: Exclude<Status, null>,
): { title: string; description: string; confirmClassName: string } {
  if (pending.kind === "remove") {
    return {
      title: "Remove this rating?",
      description: `This will remove the ${STATUS_LABELS[current]} rating. Are you sure?`,
      confirmClassName:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    };
  }
  return {
    title: "Lower this rating?",
    description: `This will lower the rating from ${STATUS_LABELS[current]} to ${STATUS_LABELS[pending.next]}. Are you sure?`,
    confirmClassName:
      "bg-[hsl(var(--status-emerging))] text-[hsl(5_60%_32%)] hover:bg-[hsl(var(--status-emerging)/0.8)]",
  };
}

export function StatusSelector({ value, onChange, size = "md" }: Props) {
  const [pending, setPending] = useState<PendingAction | null>(null);

  const padding = size === "sm" ? "px-2 py-1" : "px-2.5 py-1.5";

  function handleStatusClick(s: Exclude<Status, null>) {
    const active = value === s;
    if (active) {
      setPending({ kind: "remove" });
      return;
    }
    if (value !== null) {
      const currentIdx = progressOrder.indexOf(value);
      const nextIdx = progressOrder.indexOf(s);
      if (nextIdx < currentIdx) {
        setPending({ kind: "downgrade", next: s });
        return;
      }
    }
    onChange(s);
  }

  function handleClear() {
    if (value === null) return;
    setPending({ kind: "remove" });
  }

  function handleConfirm() {
    if (!pending) return;
    onChange(pending.kind === "downgrade" ? pending.next : null);
    setPending(null);
  }

  function handleCancel() {
    setPending(null);
  }

  const dialogProps =
    pending && value
      ? buildDialogProps(pending, value)
      : null;

  return (
    <>
      <div className="flex items-center gap-1.5 w-full">
        {/* E / D / S buttons */}
        <div className="flex flex-1 gap-1">
          {progressOrder.map((s) => {
            const active = value === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => handleStatusClick(s)}
                className={cn(baseClasses, padding, active ? styles[s].active : styles[s].idle)}
                data-testid={`status-${s}`}
              >
                {STATUS_LABELS[s]}
              </button>
            );
          })}
        </div>

        {/* Clear */}
        <button
          type="button"
          aria-label="Clear rating"
          title="Clear rating"
          onClick={handleClear}
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

      {dialogProps && (
        <ConfirmDialog
          open={pending !== null}
          title={dialogProps.title}
          description={dialogProps.description}
          confirmLabel="Yes, confirm"
          cancelLabel="Cancel"
          confirmClassName={dialogProps.confirmClassName}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}
