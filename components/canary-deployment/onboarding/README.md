# Canary Deployment Onboarding Components

This directory contains modular components for the canary deployment onboarding flow. The components are designed to be reusable, maintainable, and follow a consistent design pattern.

## Architecture

The onboarding flow is broken down into:

### Base Components
- **OnboardingStep**: Wrapper component for individual steps with back button logic
- **OnboardingHeader**: Reusable header with emoji, title, and subtitle
- **OnboardingProgress**: Progress indicator showing current step

### Step Components
Each step is a self-contained component with its own logic and UI:

1. **ConnectionStep**: GCP OAuth connection interface
2. **ProjectSelectionStep**: Project selection with cards and selection logic
3. **ServicesStep**: GCP services enablement with status indicators
4. **StorageStep**: Storage bucket creation configuration
5. **DeployStep**: Final deployment step with progress tracking
6. **SuccessStep**: Completion screen with deployment details

## Usage

```tsx
import {
  OnboardingStep,
  OnboardingHeader,
  OnboardingProgress,
  ConnectionStep,
  ProjectSelectionStep,
  ServicesStep,
  StorageStep,
  DeployStep,
  SuccessStep,
  type GCPProject,
  type GCPService
} from '@/components/canary-deployment/onboarding';

// Example usage in a step
<OnboardingStep currentStep={1} onBack={() => setStep(0)}>
  <OnboardingHeader 
    emoji="🏗️"
    title="Choose your project"
    subtitle="Select the Google Cloud project for canary deployments"
  />
  <ProjectSelectionStep 
    projects={projects}
    selectedProject={selectedProject}
    onProjectSelect={handleProjectSelect}
  />
</OnboardingStep>
```

## Component Props

### OnboardingStep
- `children`: React nodes to render
- `currentStep`: Current step number (0-5)
- `onBack`: Function to go back to previous step
- `showBackButton`: Whether to show back button (default: true)
- `loading`: Whether step is in loading state (default: false)

### OnboardingHeader
- `emoji`: Emoji icon for the step
- `title`: Step title
- `subtitle`: Step description

### OnboardingProgress
- `currentStep`: Current step number
- `progressPercent`: Progress percentage (0-100)

### Step Components
Each step component accepts relevant props for its functionality:
- Project data and selection handlers
- Loading states
- Action handlers (connect, enable, create, deploy, complete)
- Configuration data

## Design Patterns

### Animations
All components use consistent animation patterns:
- `animate-in` classes for entrance animations
- Staggered animations with `animationDelay`
- Smooth transitions with `transition-all duration-300`

### Styling
- Consistent use of Tailwind CSS classes
- Responsive design patterns
- Hover effects and micro-interactions
- Loading states with spinners

### State Management
- Props-based state management
- Callback functions for actions
- Loading states for async operations
- Error handling patterns

## Benefits

1. **Modularity**: Each step is independent and can be modified without affecting others
2. **Reusability**: Components can be reused in different contexts
3. **Maintainability**: Clear separation of concerns makes debugging easier
4. **Testability**: Individual components can be tested in isolation
5. **Consistency**: Shared design patterns ensure UI consistency
6. **Scalability**: Easy to add new steps or modify existing ones

## Future Enhancements

- Add step validation logic
- Implement step persistence
- Add accessibility improvements
- Create step configuration system
- Add animation customization options 