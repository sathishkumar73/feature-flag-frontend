// components/ExportConfirmModal.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react'; // Import for an alert icon

interface ExportConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalFlagsToExport: number; // To show the user how many flags will be exported
}

const ExportConfirmModal: React.FC<ExportConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  totalFlagsToExport,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" /> Confirm Export
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to export **{totalFlagsToExport}** feature flags to a CSV file?
            This action will download a file containing the current data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" onClick={onConfirm}>
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportConfirmModal;