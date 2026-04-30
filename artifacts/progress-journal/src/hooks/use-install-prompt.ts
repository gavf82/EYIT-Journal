import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type InstallState =
  | "unavailable"   // browser doesn't support or already installed
  | "available"     // native prompt ready (Chrome/Edge/Android)
  | "ios"           // iOS Safari — manual steps required
  | "installed";    // just confirmed installed this session

export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<InstallState>("unavailable");

  useEffect(() => {
    // Already running in standalone mode (installed)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstallState("installed");
      return;
    }

    // iOS Safari: no beforeinstallprompt event, must guide user manually
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isIOS && isSafari) {
      setInstallState("ios");
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
      setInstallState("available");
    };

    const installedHandler = () => setInstallState("installed");

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      setInstallState("installed");
      setPromptEvent(null);
    }
  };

  return { installState, install };
}
