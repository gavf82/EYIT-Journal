import { useState } from "react";
import { exportSQLite } from "../lib/sqlite";
import { useStore } from "../lib/store";
import { useToast } from "./use-toast";

export function useSaveAndClose() {
  const { resetAll, state } = useStore();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const hasData = state.children.length > 0;

  function openDialog() {
    if (hasData) setDialogOpen(true);
  }

  async function handleSaveAndClose() {
    setDialogOpen(false);
    const saved = await exportSQLite();
    if (!saved) return;
    resetAll();
    window.close();
    toast({
      title: "Session ended",
      description:
        "Your backup is saved and all local data has been cleared. You can close this tab.",
    });
  }

  async function handleSaveOnly() {
    setDialogOpen(false);
    await exportSQLite();
  }

  return {
    openDialog,
    hasData,
    dialogProps: {
      open: dialogOpen,
      onOpenChange: setDialogOpen,
      onSaveAndClose: handleSaveAndClose,
      onSaveOnly: handleSaveOnly,
    },
  };
}
