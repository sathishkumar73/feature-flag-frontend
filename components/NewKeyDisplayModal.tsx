"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Key, Copy } from "lucide-react";

interface NewKeyDisplayModalProps {
  isOpen: boolean;
  onClose: () => void; // Handles closing the modal, also marks key as seen
  onCopyKey: (key: string) => void;
  fullKey: string | undefined; // The actual full key to display
}

const NewKeyDisplayModal: React.FC<NewKeyDisplayModalProps> = ({
  isOpen,
  onClose,
  onCopyKey,
  fullKey,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  // Handle copy click with inline "Copied!" feedback
  const handleCopyClick = () => {
    if (fullKey) {
      onCopyKey(fullKey);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2s
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onEscapeKeyDown={onClose} className="min-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Your API Key
          </DialogTitle>
          <DialogDescription className="mb-2">
            This is the only time you will be able to see the full API key. Please copy it securely.
          </DialogDescription>
        </DialogHeader>

        {/* Key display block with min height and monospace font */}
        <pre className="p-4 bg-muted rounded-md font-mono text-sm break-all min-h-[3.5rem]">
          {fullKey || "API Key not available"}
        </pre>

        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleCopyClick}
            className="flex-1"
            disabled={!fullKey}
            type="button"
            aria-label="Copy API key to clipboard"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copySuccess ? "Copied!" : "Copy Key"}
          </Button>
          <Button
            onClick={onClose} // Handles both "I Have Copied" and simple close
            className="flex-1"
            variant="outline"
            type="button"
            aria-label="Close API key modal"
          >
            I Have Copied / Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewKeyDisplayModal;
