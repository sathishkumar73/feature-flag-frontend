import { render, screen, fireEvent } from "@testing-library/react";
import OnboardingTooltip from "../OnboardingTooltip";
import React from "react";

// Mock framer-motion as it causes issues in Jest DOM environment
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

describe("OnboardingTooltip", () => {
  // Create target element for tooltip
  const setupTargetElement = (id: string) => {
    const targetElement = document.createElement("div");
    targetElement.id = id;
    const mockRect = {
      top: 100,
      right: 200,
      bottom: 150,
      left: 100,
      width: 100,
      height: 50,
      x: 100,
      y: 100,
      toJSON: () => {}
    };
    targetElement.getBoundingClientRect = jest.fn().mockReturnValue(mockRect as DOMRect);
    document.body.appendChild(targetElement);
    return targetElement;
  };
  
  // Mock getBoundingClientRect for tooltip
  const mockGetBoundingClientRect = () => {
    const mockRect = {
      width: 200,
      height: 150,
      top: 0,
      left: 0,
      right: 200,
      bottom: 150,
      x: 0,
      y: 0,
      toJSON: () => {}
    };
    Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue(mockRect as DOMRect);
  };

  beforeEach(() => {
    mockGetBoundingClientRect();
    
    // Mock window properties
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    Object.defineProperty(window, 'innerHeight', { value: 768 });
    window.scrollX = 0;
    window.scrollY = 0;
    
    // Mock querySelector for main content
    document.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === '.max-w-7xl') {
        return {
          getBoundingClientRect: () => ({
            top: 50,
            right: 800,
            bottom: 700,
            left: 200,
            width: 600,
            height: 650,
          })
        };
      }
      return null;
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test("renders tooltip when visible", () => {
    const targetId = "test-target";
    setupTargetElement(targetId);
    
    const onNext = jest.fn();
    const onPrev = jest.fn();
    const onSkip = jest.fn();
    
    render(
      <OnboardingTooltip
        step={0}
        totalSteps={3}
        targetId={targetId}
        title="Test Tooltip"
        description="This is a test tooltip"
        position="bottom"
        onNext={onNext}
        onPrev={onPrev}
        onSkip={onSkip}
        isVisible={true}
      />
    );
    
    // Check if tooltip is rendered
    expect(screen.getByText("Test Tooltip")).toBeInTheDocument();
    expect(screen.getByText("This is a test tooltip")).toBeInTheDocument();
  });

  test("does not render when not visible", () => {
    const targetId = "test-target";
    setupTargetElement(targetId);
    
    const onNext = jest.fn();
    const onPrev = jest.fn();
    const onSkip = jest.fn();
    
    render(
      <OnboardingTooltip
        step={0}
        totalSteps={3}
        targetId={targetId}
        title="Test Tooltip"
        description="This is a test tooltip"
        position="bottom"
        onNext={onNext}
        onPrev={onPrev}
        onSkip={onSkip}
        isVisible={false}
      />
    );
    
    // Check if tooltip is not rendered
    expect(screen.queryByText("Test Tooltip")).not.toBeInTheDocument();
    expect(screen.queryByText("This is a test tooltip")).not.toBeInTheDocument();
  });

  test("calls onNext when Next button is clicked", () => {
    const targetId = "test-target";
    setupTargetElement(targetId);
    
    const onNext = jest.fn();
    const onPrev = jest.fn();
    const onSkip = jest.fn();
    
    render(
      <OnboardingTooltip
        step={0}
        totalSteps={3}
        targetId={targetId}
        title="Test Tooltip"
        description="This is a test tooltip"
        position="bottom"
        onNext={onNext}
        onPrev={onPrev}
        onSkip={onSkip}
        isVisible={true}
      />
    );
    
    // Click the Next button
    fireEvent.click(screen.getByText("Next"));
    
    // Check if onNext was called
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrev).not.toHaveBeenCalled();
    expect(onSkip).not.toHaveBeenCalled();
  });

  test("calls onPrev when Back button is clicked", () => {
    const targetId = "test-target";
    setupTargetElement(targetId);
    
    const onNext = jest.fn();
    const onPrev = jest.fn();
    const onSkip = jest.fn();
    
    render(
      <OnboardingTooltip
        step={1} // Not first step so Back button is enabled
        totalSteps={3}
        targetId={targetId}
        title="Test Tooltip"
        description="This is a test tooltip"
        position="bottom"
        onNext={onNext}
        onPrev={onPrev}
        onSkip={onSkip}
        isVisible={true}
      />
    );
    
    // Click the Back button
    fireEvent.click(screen.getByText("Back"));
    
    // Check if onPrev was called
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).not.toHaveBeenCalled();
    expect(onSkip).not.toHaveBeenCalled();
  });

  test("Back button is disabled on first step", () => {
    const targetId = "test-target";
    setupTargetElement(targetId);
    
    const onNext = jest.fn();
    const onPrev = jest.fn();
    const onSkip = jest.fn();
    
    render(
      <OnboardingTooltip
        step={0} // First step
        totalSteps={3}
        targetId={targetId}
        title="Test Tooltip"
        description="This is a test tooltip"
        position="bottom"
        onNext={onNext}
        onPrev={onPrev}
        onSkip={onSkip}
        isVisible={true}
      />
    );
    
    // Back button should be disabled
    const backButton = screen.getByText("Back");
    expect(backButton).toBeDisabled();
  });

  test("Next button shows 'Finish' on last step", () => {
    const targetId = "test-target";
    setupTargetElement(targetId);
    
    const onNext = jest.fn();
    const onPrev = jest.fn();
    const onSkip = jest.fn();
    
    render(
      <OnboardingTooltip
        step={2} // Last step (0-based index with 3 total steps)
        totalSteps={3}
        targetId={targetId}
        title="Test Tooltip"
        description="This is a test tooltip"
        position="bottom"
        onNext={onNext}
        onPrev={onPrev}
        onSkip={onSkip}
        isVisible={true}
      />
    );
    
    // Next button should say "Finish"
    expect(screen.getByText("Finish")).toBeInTheDocument();
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });

  test("calls onSkip when close button is clicked", () => {
    const targetId = "test-target";
    setupTargetElement(targetId);
    
    const onNext = jest.fn();
    const onPrev = jest.fn();
    const onSkip = jest.fn();
    
    render(
      <OnboardingTooltip
        step={0}
        totalSteps={3}
        targetId={targetId}
        title="Test Tooltip"
        description="This is a test tooltip"
        position="bottom"
        onNext={onNext}
        onPrev={onPrev}
        onSkip={onSkip}
        isVisible={true}
      />
    );
    
    // Click the close button (it's an X icon, so we need to use aria-label)
    fireEvent.click(screen.getByLabelText("Close tooltip"));
    
    // Check if onSkip was called
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onNext).not.toHaveBeenCalled();
    expect(onPrev).not.toHaveBeenCalled();
  });
  
  // Testing different positions
  test.each([
    "top",
    "bottom",
    "left",
    "right",
  ])("renders tooltip with %s position without crashing", (position) => {
    const targetId = "test-target";
    setupTargetElement(targetId);
    
    const onNext = jest.fn();
    const onPrev = jest.fn();
    const onSkip = jest.fn();
    
    render(
      <OnboardingTooltip
        step={0}
        totalSteps={3}
        targetId={targetId}
        title="Test Tooltip"
        description="This is a test tooltip"
        position={position as "top" | "bottom" | "left" | "right"}
        onNext={onNext}
        onPrev={onPrev}
        onSkip={onSkip}
        isVisible={true}
      />
    );
    
    // Get the tooltip container div and check if it exists
    const tooltipContainer = screen.getByText("Test Tooltip").parentElement?.parentElement;
    expect(tooltipContainer).toBeInTheDocument();
    
    // Check if the container has style attributes
    expect(tooltipContainer).toHaveStyle({ position: "fixed" });
  });
  
  test("adds highlight classes to target element", () => {
    const targetId = "test-target";
    const targetElement = setupTargetElement(targetId);
    
    const onNext = jest.fn();
    const onPrev = jest.fn();
    const onSkip = jest.fn();
    
    const { unmount } = render(
      <OnboardingTooltip
        step={0}
        totalSteps={3}
        targetId={targetId}
        title="Test Tooltip"
        description="This is a test tooltip"
        position="bottom"
        onNext={onNext}
        onPrev={onPrev}
        onSkip={onSkip}
        isVisible={true}
      />
    );
    
    // Check if highlight classes were added
    expect(targetElement.classList.contains('target-highlight')).toBe(true);
    expect(targetElement.classList.contains('target-highlight-pulse')).toBe(true);
    
    // Unmount and check if classes were removed
    unmount();
    expect(targetElement.classList.contains('target-highlight')).toBe(false);
    expect(targetElement.classList.contains('target-highlight-pulse')).toBe(false);
  });
  
  test("adds special highlighting for API key link", () => {
    const targetId = "api-key-link";
    const targetElement = setupTargetElement(targetId);
    
    const onNext = jest.fn();
    const onPrev = jest.fn();
    const onSkip = jest.fn();
    
    render(
      <OnboardingTooltip
        step={2}
        totalSteps={3}
        targetId={targetId}
        title="API Key"
        description="Get your API key"
        position="right"
        onNext={onNext}
        onPrev={onPrev}
        onSkip={onSkip}
        isVisible={true}
      />
    );
    
    // Check if special API key highlight class was added
    expect(targetElement.classList.contains('api-key-highlight')).toBe(true);
  });
  
  test("renders progress indicators correctly", () => {
    const targetId = "test-target";
    setupTargetElement(targetId);
    
    const onNext = jest.fn();
    const onPrev = jest.fn();
    const onSkip = jest.fn();
    
    render(
      <OnboardingTooltip
        step={1} // Second step (0-based index)
        totalSteps={3}
        targetId={targetId}
        title="Test Tooltip"
        description="This is a test tooltip"
        position="bottom"
        onNext={onNext}
        onPrev={onPrev}
        onSkip={onSkip}
        isVisible={true}
      />
    );
    
    // There should be 3 progress indicators, with the second one highlighted
    const progressIndicators = document.querySelectorAll(".flex.justify-center.mb-3 div");
    expect(progressIndicators.length).toBe(3);
    
    // Second indicator should have blue background class
    expect(progressIndicators[1].className).toContain("bg-blue-500");
    
    // Other indicators should not have blue background
    expect(progressIndicators[0].className).not.toContain("bg-blue-500");
    expect(progressIndicators[2].className).not.toContain("bg-blue-500");
  });
});
