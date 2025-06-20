"use client";

import React, { useEffect, useState } from "react";
import OnboardingTooltip from "./OnboardingTooltip";
import { useOnboarding, OnboardingStep } from "@/contexts/OnboardingContext";
import { usePathname } from "next/navigation";

const OnboardingOverlay: React.FC = () => {
  const { 
    currentStep, 
    nextStep, 
    prevStep, 
    skipOnboarding, 
    isOnboardingActive,
    isOnboardingComplete
  } = useOnboarding();
  const pathname = usePathname();
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );
  
  // Handle window resize to ensure tooltip positions correctly
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Determine which page we're on to show relevant onboarding
  const isFeatureFlagsPage = pathname === "/flags";
  // Keeping this commented for future use when we add API Key page onboarding
  // const isApiKeyPage = pathname === "/api-key" || pathname === "/api-keys";
  
  // Show the relevant onboarding step based on current page
  // For step 2 (API_KEY), we want to show it on the feature flags page
  const shouldShowStep = (step: number) => {
    // If onboarding context is still loading (null), don't show anything
    if (isOnboardingComplete === null) return false;
    
    // Don't show tooltips if onboarding is not active or is complete
    if (!isOnboardingActive || isOnboardingComplete === true) return false;
    
    // For API_KEY step, we only want to show it on the feature flags page
    if (step === OnboardingStep.API_KEY) {
      return isFeatureFlagsPage;
    }
    
    return isFeatureFlagsPage;
  };

  // Define tooltips for different steps
  const renderTooltip = () => {
    switch (currentStep) {
      case OnboardingStep.WELCOME:
        return (
          <OnboardingTooltip
            step={0}
            totalSteps={4}
            targetId="feature-flags-header"
            title="Welcome to Feature Flags"
            description="Let's get you started with managing your feature flags. This brief tour will show you the basics."
            position="bottom"
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={skipOnboarding}
            isVisible={shouldShowStep(OnboardingStep.WELCOME)}
          />
        );
      
      case OnboardingStep.CREATE_FLAG:
        return (
          <OnboardingTooltip
            step={1}
            totalSteps={4}
            targetId="create-flag-button"
            title="Create Your First Flag"
            description="Click here to create your first feature flag. Feature flags let you control features in your application."
            position="left"
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={skipOnboarding}
            isVisible={shouldShowStep(OnboardingStep.CREATE_FLAG)}
          />
        );
      
      case OnboardingStep.DOCUMENTATION:
        return (
          <OnboardingTooltip
            step={2}
            totalSteps={4}
            targetId="documentation-link"
            title="Explore Documentation"
            description="Check out the documentation to learn how to use GradualRollout SDK in your app."
            position="right"
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={skipOnboarding}
            isVisible={shouldShowStep(OnboardingStep.DOCUMENTATION)}
          />
        );
      
      case OnboardingStep.API_KEY:
        // Determine best position based on screen size
        const apiKeyPosition = windowWidth > 1200 ? "right" : "bottom";
        return (
          <OnboardingTooltip
            step={3}
            totalSteps={4}
            targetId="api-key-link"
            title="Get Your API Key"
            description="After creating flags, you'll need an API key to use them in your application. Click here to generate your API key."
            position={apiKeyPosition}
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={skipOnboarding}
            isVisible={shouldShowStep(OnboardingStep.API_KEY)}
          />
        );
      
      default:
        return null;
    }
  };

  return renderTooltip();
};

export default OnboardingOverlay;
