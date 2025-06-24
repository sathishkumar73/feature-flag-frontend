'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface OnboardingStepProps {
  children: React.ReactNode;
  currentStep: number;
  onBack: () => void;
  showBackButton?: boolean;
  loading?: boolean;
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({
  children,
  currentStep,
  onBack,
  showBackButton = true,
  loading = false
}) => {
  return (
    <div className="animate-in slide-in-from-bottom-4 duration-700 delay-500">
      {children}
      
      {/* Back Button */}
      {showBackButton && currentStep > 0 && currentStep < 5 && !loading && (
        <div className="absolute bottom-6 left-6 animate-in slide-in-from-left duration-500">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="hover:scale-105 transition-transform duration-200"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>
      )}
    </div>
  );
};

export default OnboardingStep; 