"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export enum OnboardingStep {
  WELCOME = 0,
  CREATE_FLAG = 1,
  DOCUMENTATION = 2,
  API_KEY = 3,
  COMPLETED = 4,
}

interface OnboardingContextType {
  currentStep: OnboardingStep;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  isOnboardingActive: boolean;
  isOnboardingComplete: boolean | null; // Can be null during initial load
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.WELCOME);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null); // Start with null to indicate "not loaded yet"
  const [isOnboardingActive, setIsOnboardingActive] = useState<boolean>(true); // Default to true but will be overridden by localStorage

  // Initialize from localStorage on component mount 
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCompletion = localStorage.getItem('onboardingComplete');
        const savedStep = localStorage.getItem('onboardingStep');
        
        // Always set the completion state first
        const isComplete = savedCompletion === 'true';
        setIsOnboardingComplete(isComplete);
        
        // Only activate onboarding if explicitly not complete
        setIsOnboardingActive(!isComplete);
        
        // Set the correct step if it exists in localStorage
        if (savedStep) {
          const stepValue = parseInt(savedStep, 10);
          // Only use valid step values
          if (!isNaN(stepValue) && stepValue >= 0 && stepValue <= OnboardingStep.COMPLETED) {
            setCurrentStep(stepValue);
          }
        }
        
        console.log("Loaded onboarding state:", { isComplete, step: savedStep });
      } catch (error) {
        console.error("Error loading onboarding state from localStorage:", error);
        // Default to active onboarding if there's an error
        setIsOnboardingComplete(false);
        setIsOnboardingActive(true);
      }
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && isOnboardingComplete !== null) {
      try {
        localStorage.setItem('onboardingComplete', isOnboardingComplete.toString());
        localStorage.setItem('onboardingStep', currentStep.toString());
        console.log("Saved onboarding state:", { isOnboardingComplete, currentStep });
      } catch (error) {
        console.error("Error saving onboarding state to localStorage:", error);
      }
    }
  }, [currentStep, isOnboardingComplete]);

  const nextStep = () => {
    // If onboarding state is still loading (null), don't allow navigation
    if (isOnboardingComplete === null) return;
    
    if (currentStep < OnboardingStep.COMPLETED) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      // When reaching the COMPLETED step, mark onboarding as complete
      if (newStep === OnboardingStep.COMPLETED) {
        setIsOnboardingComplete(true);
        setIsOnboardingActive(false);
      }
    }
  };

  const prevStep = () => {
    // If onboarding state is still loading (null), don't allow navigation
    if (isOnboardingComplete === null) return;
    
    if (currentStep > OnboardingStep.WELCOME) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    // If onboarding state is still loading (null), don't allow skipping
    if (isOnboardingComplete === null) return;
    
    setCurrentStep(OnboardingStep.COMPLETED);
    setIsOnboardingComplete(true);
    setIsOnboardingActive(false);
  };

  const resetOnboarding = () => {
    // Reset always works regardless of initial state
    setCurrentStep(OnboardingStep.WELCOME);
    setIsOnboardingComplete(false);
    setIsOnboardingActive(true);
  };

  // Force isOnboardingComplete to boolean in the return value to maintain backward compatibility
  // with components that expect it to be a boolean
  const contextValue: OnboardingContextType = {
    currentStep,
    nextStep,
    prevStep,
    skipOnboarding,
    resetOnboarding,
    isOnboardingActive,
    isOnboardingComplete,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
