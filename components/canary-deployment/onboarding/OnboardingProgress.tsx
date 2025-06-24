'use client';

import React from 'react';

interface OnboardingProgressProps {
  currentStep: number;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep
}) => {
  if (currentStep === 0) return null;

  return (
    <div className="text-center mb-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mb-2">
        <span>{currentStep} of 5</span>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                step <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingProgress; 