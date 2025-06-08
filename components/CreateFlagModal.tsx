"use client";
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CreateFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFlag: (flag: any) => void;
}

const CreateFlagModal: React.FC<CreateFlagModalProps> = ({ isOpen, onClose, onCreateFlag }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    environment: '',
    enabled: false,
    rolloutPercentage: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.environment) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const newFlag = {
      id: `flag_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      environment: formData.environment,
      enabled: formData.enabled,
      rolloutPercentage: formData.rolloutPercentage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onCreateFlag(newFlag);
    
    toast.success(`Feature flag "${formData.name}" has been created successfully.`);

    // Reset form
    setFormData({
      name: '',
      description: '',
      environment: '',
      enabled: false,
      rolloutPercentage: 0
    });
    
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      environment: '',
      enabled: false,
      rolloutPercentage: 0
    });
    onClose();
  };

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
            />
          </div>

          <div>
            <Label htmlFor="environment">Environment *</Label>
            <Select value={formData.environment} onValueChange={(value) => setFormData({ ...formData, environment: value })}>
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

          <div>
            <Label htmlFor="rollout">Initial Rollout Percentage</Label>
            <Input
              id="rollout"
              type="number"
              min="0"
              max="100"
              value={formData.rolloutPercentage}
              onChange={(e) => setFormData({ ...formData, rolloutPercentage: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Create Flag
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFlagModal; 