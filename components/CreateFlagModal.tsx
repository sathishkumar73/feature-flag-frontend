"use client";
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabaseClient'; // Adjust path as needed

interface CreateFeatureFlagDto {
  name: string;
  description?: string;
  enabled?: boolean;
  environment: string;
  rolloutPercentage?: number;
}

interface CreatedFlagResponse {
  id: string;
  name: string;
  description: string;
  environment: "Production" | "Staging" | "Development";
  enabled: boolean;
  rolloutPercentage: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFlag: (flag: CreatedFlagResponse) => void;
  backendUrl: string;
}

const CreateFlagModal: React.FC<CreateFlagModalProps> = ({ isOpen, onClose, onCreateFlag, backendUrl }) => {
  const [formData, setFormData] = useState<CreateFeatureFlagDto>({
    name: '',
    description: '',
    environment: '',
    enabled: false,
    rolloutPercentage: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

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

    if (!formData.name || !formData.environment || (formData.description === undefined || formData.description === '')) {
      toast.error("Please fill in all required fields (Name, Description, Environment).");
      return;
    }

    setIsLoading(true);
    setIsAuthLoading(true);

    let accessToken: string | null = null;
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(`Supabase session error: ${sessionError.message}`);
      if (!session || !session.access_token) throw new Error("User not authenticated. Please log in.");
      accessToken = session.access_token;
    } catch (authError: any) {
      console.error('Authentication Error:', authError);
      toast.error(authError.message || "Could not get authentication token. Please log in again.");
      setIsLoading(false);
      setIsAuthLoading(false);
      return;
    } finally {
      setIsAuthLoading(false);
    }

    try {
      const payload: CreateFeatureFlagDto = {
        name: formData.name,
        environment: formData.environment,
        ...(formData.description && { description: formData.description }),
        ...(formData.enabled !== undefined && { enabled: formData.enabled }),
        ...(formData.rolloutPercentage !== undefined && { rolloutPercentage: formData.rolloutPercentage }),
      };

      const response = await fetch(`${backendUrl}/flags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create flag: ${response.statusText}`);
      }

      const newFlag: CreatedFlagResponse = await response.json();
      onCreateFlag(newFlag);
      toast.success(`Feature flag "${newFlag.name}" has been created successfully.`);
      resetForm();
      onClose();
    } catch (apiError: any) {
      console.error('Error creating feature flag:', apiError);
      toast.error(apiError.message || "An unexpected error occurred while creating the flag.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const submitButtonText = isLoading ? (isAuthLoading ? 'Authenticating...' : 'Creating...') : 'Create Flag';
  const isFormDisabled = isLoading || isAuthLoading;

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
