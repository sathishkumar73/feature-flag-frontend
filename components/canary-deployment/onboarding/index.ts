// Base components
export { default as OnboardingStep } from './OnboardingStep';
export { default as OnboardingHeader } from './OnboardingHeader';
export { default as OnboardingProgress } from './OnboardingProgress';

// Step components
export { default as ConnectionStep } from './steps/ConnectionStep';
export { default as ProjectSelectionStep } from './steps/ProjectSelectionStep';
export { default as ServicesStep } from './steps/ServicesStep';
export { default as StorageStep } from './steps/StorageStep';
export { default as DeployStep } from './steps/DeployStep';
export { default as SuccessStep } from './steps/SuccessStep';

// Re-export types from main types file
export type { GCPProject, GCPService } from '../types'; 