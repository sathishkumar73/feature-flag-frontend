"use client";
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Key, Copy } from 'lucide-react';

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onEscapeKeyDown={onClose}> {/* Use onClose to handle ESC key */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Your API Key
          </DialogTitle>
          <DialogDescription>
            This is the only time you will be able to see the full API key. Please copy it securely.
          </DialogDescription>
        </DialogHeader>
        <pre className="p-4 bg-muted rounded-md font-mono text-sm break-all">
          {fullKey || "API Key not available"}
        </pre>
        <div className="flex gap-3 mt-4">
          <Button
            onClick={() => fullKey && onCopyKey(fullKey)}
            className="flex-1"
            disabled={!fullKey}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Key
          </Button>
          <Button
            onClick={onClose} // This handles both "I Have Copied" and simple close
            className="flex-1"
            variant="outline"
          >
            I Have Copied / Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewKeyDisplayModal;