import { exportCollectionJSON } from "../lib/export";
import { useStore } from "../lib/store";
import { useToast } from "./use-toast";

export function useSaveAndClose() {
  const { resetAll, state } = useStore();
  const { toast } = useToast();

  const hasData = state.children.length > 0;

  async function saveAndClose() {
    const saved = await exportCollectionJSON();
    if (!saved) return;
    resetAll();
    window.close();
    toast({
      title: "Session ended",
      description:
        "Your backup is saved and all local data has been cleared. You can close this tab.",
    });
  }

  return { saveAndClose, hasData };
}
