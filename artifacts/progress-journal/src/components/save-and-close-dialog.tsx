import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut, Save } from "lucide-react";

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
          <DialogTitle>Save session</DialogTitle>
          <DialogDescription>
            A backup file will be downloaded in both cases. Would you like to
            also clear all data from this browser and close the tab?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button className="gap-2 w-full" onClick={onSaveAndClose}>
            <LogOut className="h-4 w-4" /> Save and close
          </Button>
          <Button variant="outline" className="gap-2 w-full" onClick={onSaveOnly}>
            <Save className="h-4 w-4" /> Save only
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
