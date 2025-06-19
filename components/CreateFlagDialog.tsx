"use client";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
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

interface CreateFlagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlagCreated?: (response: FeatureFlag) => void;
  className?: string;
}

export default function CreateFlagDialog({
  open,
  onOpenChange,
  onFlagCreated,
  className,
}: CreateFlagDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [environment, setEnvironment] = useState("production");
  const [enabled, setEnabled] = useState(false);

  const handleCreateFlag = async () => {
    try {
      const response = await flagService.createFlag({
        name,
        description,
        environment,
        enabled,
      }) as FeatureFlag;
      toast.success("Feature flag created successfully.");
      onOpenChange(false);
      onFlagCreated?.(response);
    } catch (error) {
      console.error("Error creating flag:", error);
      toast.error("Failed to create feature flag.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className={className}>Create Feature Flag</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Feature Flag</DialogTitle>
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
          <Button onClick={handleCreateFlag}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
