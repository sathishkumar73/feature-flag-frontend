"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { useOnboarding } from "@/contexts/OnboardingContext";

export default function OnboardingResetButton() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { resetOnboarding } = useOnboarding();

  const handleReset = () => {
    resetOnboarding();
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setDialogOpen(true)}
      >
        <Info className="h-3 w-3" />
        Show onboarding tour
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restart Onboarding Tour</DialogTitle>
            <DialogDescription>
              Would you like to restart the onboarding tour? This will show you the feature flag basics again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReset}>
              Start Tour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
