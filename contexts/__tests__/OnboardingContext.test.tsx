import { render, screen, act, renderHook } from "@testing-library/react";
import { useOnboarding, OnboardingProvider, OnboardingStep } from "../OnboardingContext";
import React from "react";

// Mock localStorage
const mockLocalStorage = (() => {
  const store: Record<string, string> = {};
  
  return {
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: string): void {
      store[key] = value;
    },
    clear(): void {
      Object.keys(store).forEach(key => {
        delete store[key];
      });
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe("OnboardingContext", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <OnboardingProvider>{children}</OnboardingProvider>
  );
  
  test("initial state has WELCOME step and is not complete after localStorage initialization", () => {
    // Clear localStorage first to simulate first visit
    mockLocalStorage.clear();
    
    // Act phase to wait for the useEffect that reads from localStorage
    let result: any;
    act(() => {
      result = renderHook(() => useOnboarding(), { wrapper }).result;
    });
    
    // Initial load sets null, which then gets updated after the useEffect runs
    expect(result.current.currentStep).toBe(OnboardingStep.WELCOME);
    expect(result.current.isOnboardingActive).toBe(true);
    
    // After localStorage initialization, isOnboardingComplete should be false (not null)
    expect(result.current.isOnboardingComplete).toBe(false);
  });

  test("nextStep advances to the next step", () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    
    act(() => {
      result.current.nextStep();
    });
    
    expect(result.current.currentStep).toBe(OnboardingStep.CREATE_FLAG);
  });

  test("prevStep goes back to the previous step", () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    
    // First go forward one step
    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentStep).toBe(OnboardingStep.CREATE_FLAG);
    
    // Then go back
    act(() => {
      result.current.prevStep();
    });
    expect(result.current.currentStep).toBe(OnboardingStep.WELCOME);
  });

  test("prevStep does nothing if already at first step", () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    
    expect(result.current.currentStep).toBe(OnboardingStep.WELCOME);
    
    act(() => {
      result.current.prevStep();
    });
    
    expect(result.current.currentStep).toBe(OnboardingStep.WELCOME);
  });

  test("skipOnboarding completes the onboarding", () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    
    act(() => {
      result.current.skipOnboarding();
    });
    
    expect(result.current.currentStep).toBe(OnboardingStep.COMPLETED);
    expect(result.current.isOnboardingComplete).toBe(true);
    expect(result.current.isOnboardingActive).toBe(false);
  });

  test("resetOnboarding resets to initial step and marks as not complete", () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    
    // First complete onboarding
    act(() => {
      result.current.skipOnboarding();
    });
    
    expect(result.current.isOnboardingComplete).toBe(true);
    
    // Then reset
    act(() => {
      result.current.resetOnboarding();
    });
    
    expect(result.current.currentStep).toBe(OnboardingStep.WELCOME);
    expect(result.current.isOnboardingComplete).toBe(false);
    expect(result.current.isOnboardingActive).toBe(true);
  });

  test("completing all steps marks onboarding as complete", () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    
    // Note: In the context implementation, we have to step through each onboarding step
    // individually to reach COMPLETED
    act(() => {
      result.current.nextStep(); // WELCOME -> CREATE_FLAG
    });
    
    expect(result.current.currentStep).toBe(OnboardingStep.CREATE_FLAG);
    
    act(() => {
      result.current.nextStep(); // CREATE_FLAG -> DOCUMENTATION
    });
    
    expect(result.current.currentStep).toBe(OnboardingStep.DOCUMENTATION);
    
    act(() => {
      result.current.nextStep(); // DOCUMENTATION -> API_KEY
    });
    
    expect(result.current.currentStep).toBe(OnboardingStep.API_KEY);
    
    act(() => {
      result.current.nextStep(); // API_KEY -> COMPLETED
    });
    
    expect(result.current.currentStep).toBe(OnboardingStep.COMPLETED);
    expect(result.current.isOnboardingComplete).toBe(true);
    expect(result.current.isOnboardingActive).toBe(false);
  });

  test("localStorage persists the onboarding state across page refreshes", () => {
    // Clear localStorage to start fresh
    mockLocalStorage.clear();
    
    // First render to set initial state
    const { result, unmount } = renderHook(() => useOnboarding(), { wrapper });
    
    // Advance to step 1
    act(() => {
      result.current.nextStep();
    });
    
    expect(result.current.currentStep).toBe(OnboardingStep.CREATE_FLAG);
    
    // Verify localStorage was updated
    expect(mockLocalStorage.getItem("onboardingStep")).toBe("1");
    expect(mockLocalStorage.getItem("onboardingComplete")).toBe("false");
    
    // Unmount to simulate page refresh
    unmount();
    
    // Second render should load from localStorage
    let newResult: any;
    act(() => {
      newResult = renderHook(() => useOnboarding(), { wrapper }).result;
    });
    
    // After localStorage is loaded, state should be preserved
    expect(newResult.current.currentStep).toBe(OnboardingStep.CREATE_FLAG);
    expect(newResult.current.isOnboardingActive).toBe(true);
    expect(newResult.current.isOnboardingComplete).toBe(false);
  });
  
  test("onboarding stays active across page refreshes until explicitly completed", () => {
    // Clear localStorage and set up initial state
    mockLocalStorage.clear();
    mockLocalStorage.setItem("onboardingStep", "1");  // CREATE_FLAG step
    mockLocalStorage.setItem("onboardingComplete", "false");
    
    // Render the hook as if after a page refresh
    let firstRender: any;
    act(() => {
      firstRender = renderHook(() => useOnboarding(), { wrapper });
    });
    
    // Verify state was loaded from localStorage
    expect(firstRender.result.current.currentStep).toBe(OnboardingStep.CREATE_FLAG);
    expect(firstRender.result.current.isOnboardingActive).toBe(true);
    expect(firstRender.result.current.isOnboardingComplete).toBe(false);
    
    // Unmount and remount to simulate page refresh
    firstRender.unmount();
    
    // Render again
    let secondRender: any;
    act(() => {
      secondRender = renderHook(() => useOnboarding(), { wrapper });
    });
    
    // Should still be active
    expect(secondRender.result.current.isOnboardingActive).toBe(true);
  });

  test("completed state is persisted in localStorage", () => {
    // First render to set initial state
    const { result, unmount } = renderHook(() => useOnboarding(), { wrapper });
    
    act(() => {
      result.current.skipOnboarding();
    });
    
    expect(result.current.isOnboardingComplete).toBe(true);
    
    // Unmount and remount to simulate a page refresh
    unmount();
    
    // Check localStorage was updated
    expect(mockLocalStorage.getItem("onboardingComplete")).toBe("true");
    
    // Second render should load from localStorage
    const { result: newResult } = renderHook(() => useOnboarding(), { wrapper });
    
    expect(newResult.current.isOnboardingComplete).toBe(true);
    expect(newResult.current.isOnboardingActive).toBe(false);
  });

  test("context is required within provider", () => {
    // Mock console.error to avoid React error logs in test output
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Using context outside provider should throw an error
    expect(() => {
      const { result } = renderHook(() => useOnboarding());
    }).toThrow("useOnboarding must be used within an OnboardingProvider");
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
