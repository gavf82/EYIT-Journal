import { useState, useEffect } from "react";

export function StartupErrorBanner() {
  const [message, setMessage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.electronAPI) return;
    const unsub = window.electronAPI.onStartupError((msg) => {
      setMessage(msg);
      setDismissed(false);
    });
    return unsub;
  }, []);

  if (!message || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 shadow-md print:hidden">
      <div className="flex items-start justify-between gap-3 bg-red-700 px-4 py-2.5 text-sm text-white">
        <span className="flex-1 leading-snug">
          <strong className="font-semibold">Startup warning: </strong>
          {message}
        </span>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="mt-0.5 shrink-0 rounded px-2 py-0.5 font-medium transition-colors hover:bg-white/20"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
