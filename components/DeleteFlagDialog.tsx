// components/DeleteFlagDialog.tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DeleteFlagDialogProps } from "./types/flag-list";
import { deleteFlag } from "@/services/flagService";
import { toast } from "sonner";

export default function DeleteFlagDialog({
  open,
  onOpenChange,
  flagToDelete,
  onFlagDeleted,
}: DeleteFlagDialogProps) {
  const handleConfirmDelete = async () => {
    onOpenChange(true);
    if (flagToDelete?.id) {
      try {
        await deleteFlag(flagToDelete.id);
        toast.success(
          `Feature flag "${flagToDelete.name}" deleted successfully.`
        );
        onOpenChange(false);
        onFlagDeleted?.(flagToDelete);
      } catch (error) {
        console.error("Error deleting flag:", error);
        toast.error(`Failed to delete feature flag "${flagToDelete.name}".`);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Deleting "{flagToDelete?.name}" will
            permanently remove this feature flag.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmDelete}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
