"use client";
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Plus } from 'lucide-react';

interface GenerateKeyConfirmDialogProps {
  onConfirm: () => void;
  isGenerating: boolean;
  isDisabled?: boolean;
}

const GenerateKeyConfirmDialog: React.FC<GenerateKeyConfirmDialogProps> = ({
  onConfirm,
  isGenerating,
  isDisabled = false,
}) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false); // Close dialog after action
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={isDisabled}>
          <Plus className="h-4 w-4" />
          Generate New API Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Generate New API Key
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <div>Generating a new API key will immediately revoke your current key.</div>
            <div className="font-medium text-foreground">
              This action cannot be undone. Make sure to update all applications using the current key.
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isGenerating} className="flex-1">
            {isGenerating ? "Generating..." : "Generate Key"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateKeyConfirmDialog;