/**
 * CloudSyncProvider
 *
 * Mounts the useCloudSync hook once in the tree and shows the
 * "upload local data to cloud?" dialog on first sign-in.
 */

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Cloud, HardDrive } from "lucide-react";
import { useCloudSync } from "../hooks/use-cloud-sync";

export function CloudSyncProvider() {
  const { showUploadPrompt, handleUploadConfirmed, handleUploadSkipped } = useCloudSync();

  return (
    <AlertDialog open={showUploadPrompt}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            Upload local data to the cloud?
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-1">
            You have existing journal data saved locally on this device. Would you like to
            upload it to your cloud account so you can access it from any device?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="rounded-lg border border-border p-3 text-sm">
            <div className="flex items-center gap-1.5 font-medium mb-1 text-foreground">
              <Cloud className="h-4 w-4 text-primary" /> Upload to cloud
            </div>
            <p className="text-xs text-muted-foreground">
              Copy your local data to the cloud. Both copies are kept.
            </p>
          </div>
          <div className="rounded-lg border border-border p-3 text-sm">
            <div className="flex items-center gap-1.5 font-medium mb-1 text-foreground">
              <HardDrive className="h-4 w-4" /> Keep local data
            </div>
            <p className="text-xs text-muted-foreground">
              Keep using your existing local data. New changes will sync to the cloud.
            </p>
          </div>
        </div>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleUploadSkipped} className="w-full sm:w-auto">
            Skip for now
          </Button>
          <Button onClick={handleUploadConfirmed} className="w-full sm:w-auto gap-1.5">
            <Cloud className="h-4 w-4" />
            Upload to cloud
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
