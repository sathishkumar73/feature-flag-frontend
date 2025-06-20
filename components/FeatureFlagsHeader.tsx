"use client";
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OnboardingResetButton from './OnboardingResetButton';

interface FeatureFlagsHeaderProps {
  onOpenCreateModal: () => void;
}

const FeatureFlagsHeader: React.FC<FeatureFlagsHeaderProps> = ({ onOpenCreateModal }) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2" id="feature-flags-header">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Feature Flags</h1>
          <p className="text-muted-foreground">
            Manage and monitor all your feature flags here.
          </p>
        </div>
        <Button 
          onClick={onOpenCreateModal} 
          className="flex items-center gap-2"
          id="create-flag-button"
        >
          <Plus className="h-4 w-4" />
          Create Flag
        </Button>
      </div>
      <div className="flex justify-end">
        <OnboardingResetButton />
      </div>
    </div>
  );
};

export default FeatureFlagsHeader;