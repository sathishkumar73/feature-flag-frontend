# Canary Deployment Modular Structure

This document explains the modular structure of the CanaryOnboarding component and how it's organized.

## Overview

The `CanaryOnboarding` component has been refactored into a modular structure with the following benefits:

- **Separation of Concerns**: Each step is its own component
- **Reusability**: Individual steps can be reused in other contexts
- **Maintainability**: Easier to maintain and test individual pieces
- **Type Safety**: Shared types across all components
- **Custom Hooks**: Business logic separated from UI components

## File Structure

```
components/canary-deployment/
├── CanaryOnboarding.tsx          # Main component (orchestrator)
├── types.ts                      # Shared TypeScript interfaces
├── mockData.ts                   # Mock data and API calls
├── hooks/
│   └── useCanaryOnboarding.ts    # Custom hook for state management
├── utils/
│   └── stepConfig.ts             # Step configuration utility
├── onboarding/
│   ├── index.ts                  # Exports all onboarding components
│   ├── OnboardingStep.tsx        # Base step component
│   ├── OnboardingHeader.tsx      # Step header component
│   ├── OnboardingProgress.tsx    # Progress indicator
│   └── steps/
│       ├── ConnectionStep.tsx    # Step 0: OAuth connection
│       ├── ProjectSelectionStep.tsx # Step 1: Project selection
│       ├── ServicesStep.tsx      # Step 2: Enable services
│       ├── StorageStep.tsx       # Step 3: Create bucket
│       ├── DeployStep.tsx        # Step 4: Deploy proxy
│       └── SuccessStep.tsx       # Step 5: Success
└── index.ts                      # Main exports
```

## Component Architecture

### 1. Main Component (`CanaryOnboarding.tsx`)
- **Role**: Orchestrator component that manages the overall flow
- **Responsibilities**:
  - Modal rendering and layout
  - Step navigation and transitions
  - Progress bar management
  - Header and step indicator rendering

### 2. Custom Hook (`useCanaryOnboarding.ts`)
- **Role**: Business logic and state management
- **Responsibilities**:
  - State management for all steps
  - API calls and data fetching
  - Step transitions and animations
  - Event handlers for each step

### 3. Step Components (`steps/*.tsx`)
- **Role**: Individual step UI components
- **Responsibilities**:
  - Rendering step-specific UI
  - Handling step-specific interactions
  - Animations and transitions
  - Error states and loading states

### 4. Shared Types (`types.ts`)
- **Role**: TypeScript interfaces and types
- **Includes**:
  - `GCPProject`: Google Cloud Project interface
  - `GCPService`: GCP Service interface
  - `CanaryOnboardingProps`: Main component props
  - `StepConfig`: Step configuration interface
  - `MockApiCalls`: Mock API interface

### 5. Mock Data (`mockData.ts`)
- **Role**: Mock data and API calls for development
- **Includes**:
  - `MOCK_PROJECTS`: Sample GCP projects
  - `MOCK_SERVICES`: Sample GCP services
  - `mockApiCalls`: Mock API functions with realistic delays

### 6. Utilities (`utils/stepConfig.ts`)
- **Role**: Step configuration management
- **Responsibilities**:
  - Step titles, subtitles, and emojis
  - Dynamic content based on step state

## Usage

### Basic Usage
```tsx
import { CanaryOnboarding } from '@/components/canary-deployment';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <CanaryOnboarding
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onComplete={(deploymentUrl) => {
        console.log('Onboarding completed:', deploymentUrl);
        setIsOpen(false);
      }}
    />
  );
}
```

### Starting at a Specific Step
```tsx
<CanaryOnboarding
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  initialStep={2} // Start at project selection
  onComplete={handleComplete}
/>
```

### Using Individual Steps
```tsx
import { ConnectionStep, ProjectSelectionStep } from '@/components/canary-deployment';

function CustomOnboarding() {
  return (
    <div>
      <ConnectionStep 
        loading={false}
        onConnect={() => console.log('Connect clicked')}
      />
      <ProjectSelectionStep
        projects={projects}
        selectedProject={selectedProject}
        loading={false}
        onProjectSelect={handleProjectSelect}
      />
    </div>
  );
}
```

### Using the Custom Hook
```tsx
import { useCanaryOnboarding } from '@/components/canary-deployment';

function CustomOnboarding() {
  const {
    currentStep,
    projects,
    selectedProject,
    handleConnect,
    handleProjectSelect,
    // ... other state and handlers
  } = useCanaryOnboarding({ 
    isOpen: true, 
    initialStep: 1,
    onComplete: handleComplete 
  });

  // Use the state and handlers in your custom UI
}
```

## Benefits of This Structure

1. **Modularity**: Each step is independent and can be tested separately
2. **Reusability**: Steps can be used in different contexts
3. **Maintainability**: Changes to one step don't affect others
4. **Type Safety**: Shared types ensure consistency
5. **Separation of Concerns**: UI logic separated from business logic
6. **Testability**: Each component can be unit tested independently
7. **Flexibility**: Easy to add new steps or modify existing ones

## Adding New Steps

To add a new step:

1. Create a new step component in `onboarding/steps/`
2. Add the step to the main component's step rendering logic
3. Update the step configuration in `utils/stepConfig.ts`
4. Add any new types to `types.ts`
5. Update the custom hook if needed

## Testing

Each component can be tested independently:

```tsx
// Test individual step
import { render, screen } from '@testing-library/react';
import { ConnectionStep } from '@/components/canary-deployment';

test('ConnectionStep renders correctly', () => {
  render(<ConnectionStep loading={false} onConnect={() => {}} />);
  expect(screen.getByText('Connect with Google Cloud')).toBeInTheDocument();
});

// Test custom hook
import { renderHook } from '@testing-library/react';
import { useCanaryOnboarding } from '@/components/canary-deployment';

test('useCanaryOnboarding initializes correctly', () => {
  const { result } = renderHook(() => 
    useCanaryOnboarding({ isOpen: true, initialStep: 1 })
  );
  expect(result.current.currentStep).toBe(1);
});
``` 