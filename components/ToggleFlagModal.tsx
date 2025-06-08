"use client";
import React, { useState } from 'react';
import { Power, PowerOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FeatureFlag } from '@/types/flag';

interface ToggleFlagModalProps {
  flag: FeatureFlag | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFlag: (flag: FeatureFlag) => Promise<void>;
}

const ToggleFlagModal: React.FC<ToggleFlagModalProps> = ({ 
  flag, 
  isOpen, 
  onClose, 
  onToggleFlag 
}) => {
  const [reason, setReason] = useState('');

  if (!flag) return null;

  const isEnabling = !flag.enabled;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast.error('Please provide a reason for this change.');
      return;
    }

    onToggleFlag(flag);
    
    toast.success(`"${flag.name}" has been ${isEnabling ? 'enabled' : 'disabled'}.`);

    setReason('');
    onClose();
  };

  const handleCancel = () => {
    setReason('');
    onClose();
  };

  const handleConfirm = async () => {
    if (flag) {
      await onToggleFlag(flag);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEnabling ? (
              <Power className="h-5 w-5 text-green-600" />
            ) : (
              <PowerOff className="h-5 w-5 text-red-600" />
            )}
            {isEnabling ? 'Enable' : 'Disable'} Feature Flag
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-md">
            <p className="font-medium">{flag.name}</p>
            <p className="text-sm text-muted-foreground">{flag.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="reason">
                Reason for {isEnabling ? 'enabling' : 'disabling'} this flag *
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Explain why you are ${isEnabling ? 'enabling' : 'disabling'} this flag...`}
                required
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                type="submit"
                variant={isEnabling ? "default" : "destructive"}
              >
                {isEnabling ? 'Enable Flag' : 'Disable Flag'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToggleFlagModal; 