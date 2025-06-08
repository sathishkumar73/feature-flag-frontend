// components/CreateFlagModal.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FeatureFlag } from '@/types/flag';
// Removed toast import as error/success toasts are now handled by the hook
// Removed supabase import as auth logic is handled by the hook

// DTO for creating a flag (what we send to backend)
interface CreateFeatureFlagDto {
  name: string;
  description?: string;
  enabled?: boolean;
  environment: string;
  rolloutPercentage?: number;
}

// Removed CreatedFlagResponse and backendUrl, as this component doesn't interact with the API directly
interface CreateFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFlag: (formData: CreateFeatureFlagDto) => Promise<FeatureFlag | null>;
  isSubmitting: boolean;
}

const CreateFlagModal: React.FC<CreateFlagModalProps> = ({
  isOpen,
  onClose,
  onCreateFlag,
  isSubmitting // Use the prop for loading state
}) => {
  const [formData, setFormData] = useState<CreateFeatureFlagDto>({
    name: '',
    description: '',
    environment: '',
    enabled: false,
    rolloutPercentage: 0
  });

  // FIX: Removed internal isLoading and isAuthLoading states, they are replaced by isSubmitting prop

  // Reset form when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      environment: '',
      enabled: false,
      rolloutPercentage: 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation for required fields
    if (!formData.name || !formData.environment || (formData.description === undefined || formData.description === '')) {
      // You might want to add a toast here for immediate user feedback on invalid form
      alert("Please fill in all required fields (Name, Description, Environment)."); // Using alert for simplicity
      return;
    }

    // FIX: Call the onCreateFlag prop, which is expected to be the hook's function
    try {
      await onCreateFlag(formData); // This call triggers the API request in the hook
      resetForm(); // Reset form on successful submission
      onClose();   // Close modal on successful submission
    } catch (error) {
      // The hook's onCreateFlag function should handle its own error toasts.
      // This catch block can be used for any local UI error handling if needed,
      // but typically, the hook handles the primary user feedback.
      console.error("Form submission error handled by parent:", error);
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  // FIX: Form disabled state and button text controlled by isSubmitting prop
  const isFormDisabled = isSubmitting;
  const submitButtonText = isSubmitting ? 'Creating...' : 'Create Flag';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Feature Flag
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Flag Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., new-checkout-flow"
              required
              disabled={isFormDisabled}
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this flag controls..."
              required
              disabled={isFormDisabled}
            />
          </div>

          <div>
            <Label htmlFor="environment">Environment *</Label>
            <Select
              value={formData.environment}
              onValueChange={(value) => setFormData({ ...formData, environment: value })}
              disabled={isFormDisabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Staging">Staging</SelectItem>
                <SelectItem value="Production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="enabled">Enabled (Initial State)</Label>
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
              disabled={isFormDisabled}
            />
          </div>

          <div>
            <Label htmlFor="rollout">Initial Rollout Percentage</Label>
            <Input
              id="rollout"
              type="number"
              min={0}
              max={100}
              value={formData.rolloutPercentage}
              onChange={(e) => setFormData({ ...formData, rolloutPercentage: parseInt(e.target.value) || 0 })}
              disabled={isFormDisabled}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isFormDisabled}>
              Cancel
            </Button>
            <Button type="submit" disabled={isFormDisabled}>
              {submitButtonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFlagModal;