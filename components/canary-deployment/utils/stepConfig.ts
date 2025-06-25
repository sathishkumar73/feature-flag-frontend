import { StepConfig } from '../types';

export const getStepConfig = (currentStep: number, projectsCount: number = 0): StepConfig => {
  const configs: StepConfig[] = [
    {
      title: "Let's get you set up! 👋",
      subtitle: "Connect your Google Cloud account to start deploying canary proxies",
      emoji: "☁️"
    },
    {
      title: "Choose your project",
      subtitle: `We found ${projectsCount} projects. Which one would you like to use?`,
      emoji: "🏗️"
    },
    {
      title: "Enable required services",
      subtitle: "We'll automatically enable the APIs you need",
      emoji: "⚙️"
    },
    {
      title: "Create storage bucket",
      subtitle: "Setting up storage for your builds",
      emoji: "📦"
    },
    {
      title: "Deploy your proxy",
      subtitle: "Almost there! Deploying your canary proxy service",
      emoji: "🚀"
    },
    {
      title: "All done! 🎉",
      subtitle: "Your canary deployment system is ready",
      emoji: "✨"
    }
  ];
  
  return configs[currentStep] || configs[0];
}; 