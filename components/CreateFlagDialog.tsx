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

interface CreateFlagDialogProps {
  onFlagCreated: () => void;
  className?: string;
}

export default function CreateFlagDialog({
  onFlagCreated,
  className,
}: CreateFlagDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [environment, setEnvironment] = useState("production");
  const [enabled, setEnabled] = useState(false);

  const handleCreateFlag = async () => {
    try {
      await fetch("/flags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
        body: JSON.stringify({
          name,
          description,
          environment,
          enabled,
          rolloutPercentage: 0, // Default rollout
        }),
      });
      toast.success('Feature flag created successfully.')
      onFlagCreated(); // Refresh flag list after creation
    } catch (error) {
      console.error("Error creating flag:", error);
      toast.error('Failed to create feature flag.')
    }
  };

  return (
    <Dialog>
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
