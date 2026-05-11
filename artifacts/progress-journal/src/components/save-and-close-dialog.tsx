import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut, Download } from "lucide-react";

interface SaveAndCloseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveAndClose: () => void;
  onSaveOnly: () => void;
}

export function SaveAndCloseDialog({
  open,
  onOpenChange,
  onSaveAndClose,
  onSaveOnly,
}: SaveAndCloseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Export backup</DialogTitle>
          <DialogDescription>
            Your changes are already saved automatically. This downloads a
            backup .db file you can restore later. Would you also like to clear
            all data from this browser afterwards?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button className="gap-2 w-full" onClick={onSaveAndClose}>
            <LogOut className="h-4 w-4" /> Export and clear browser data
          </Button>
          <Button variant="outline" className="gap-2 w-full" onClick={onSaveOnly}>
            <Download className="h-4 w-4" /> Export backup only
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
