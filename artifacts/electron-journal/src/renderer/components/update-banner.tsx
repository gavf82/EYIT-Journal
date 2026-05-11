import { useState, useEffect } from "react";
import type { UpdateStatus } from "../../types";

export function UpdateBanner() {
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.electronAPI) return;
    const unsub = window.electronAPI.onUpdateStatus(setStatus);
    return unsub;
  }, []);

  if (!status) return null;

  if (status.phase === "downloaded") {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 shadow-md print:hidden">
        <div className="flex items-center justify-between gap-3 bg-emerald-700 px-4 py-2 text-sm text-white">
          <span>
            Update ready{status.version ? ` — v${status.version}` : ""}.
            Restart to install.
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {status.releaseNotes && (
              <button
                onClick={() => setNotesOpen((o) => !o)}
                className="rounded bg-white/20 px-3 py-0.5 font-medium transition-colors hover:bg-white/30"
              >
                {notesOpen ? "Hide notes" : "What's new"}
              </button>
            )}
            <button
              onClick={() => window.electronAPI.installUpdate()}
              className="rounded bg-white px-3 py-0.5 font-semibold text-emerald-800 transition-colors hover:bg-white/90"
            >
              Restart now
            </button>
          </div>
        </div>
        {notesOpen && status.releaseNotes && (
          <div className="max-h-48 overflow-y-auto bg-emerald-900 px-4 py-3 text-xs text-emerald-100">
            <pre className="whitespace-pre-wrap font-sans leading-relaxed">
              {status.releaseNotes}
            </pre>
          </div>
        )}
      </div>
    );
  }

  if (status.phase === "downloading" || status.phase === "available") {
    const percent = status.phase === "downloading" ? status.percent : undefined;
    return (
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 bg-stone-600 px-4 py-2 text-sm text-white shadow-md print:hidden">
        <span className="flex-1">
          {status.phase === "available"
            ? `Downloading update${status.version ? ` v${status.version}` : ""}…`
            : `Downloading update${status.version ? ` v${status.version}` : ""}${percent !== undefined ? ` — ${percent}%` : "…"}`}
        </span>
        {percent !== undefined && (
          <div className="h-1 w-28 shrink-0 overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  return null;
}
