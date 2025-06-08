// components/EditFlagDialog.tsx
"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import flagService from "@/services/flagService";
import { FeatureFlag } from "@/components/types/flag";

interface EditFlagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlagUpdated?: (response: FeatureFlag) => void;
  initialFlag: FeatureFlag; // Make this required for the edit dialog
}

export default function EditFlagDialog({
  open,
  onOpenChange,
  onFlagUpdated,
  initialFlag,
}: EditFlagDialogProps) {
  const [name, setName] = useState(initialFlag.name);
  const [description, setDescription] = useState(initialFlag.description || "");
  const [environment, setEnvironment] = useState(initialFlag.environment || "production");
  const [enabled, setEnabled] = useState(initialFlag.enabled || false);

  useEffect(() => {
    setName(initialFlag.name);
    setDescription(initialFlag.description || "");
    setEnvironment(initialFlag.environment || "production");
    setEnabled(initialFlag.enabled || false);
  }, [initialFlag]);

  const handleSaveFlag = async () => {
    try {
      const response = await flagService.updateFlag(initialFlag.id, {
        name,
        description,
        environment,
        enabled,
      }) as FeatureFlag;
      toast.success("Feature flag updated successfully.");
      onOpenChange(false);
      onFlagUpdated?.(response);
    } catch (error) {
      console.error("Error updating flag:", error);
      toast.error("Failed to update feature flag.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Feature Flag</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Flag Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="Flag Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            placeholder="Environment (e.g., production, staging)"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <label>Enabled</label>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={handleSaveFlag}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}