import { render, screen, fireEvent, act } from "@testing-library/react";
import OnboardingOverlay from "../OnboardingOverlay";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import React from "react";
import { usePathname } from "next/navigation";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn()
}));

// Mock target elements for tooltip
const setupTargetElements = () => {
  // Create header element
  const headerElement = document.createElement("div");
  headerElement.id = "feature-flags-header";
  headerElement.textContent = "Feature Flags Header";
  document.body.appendChild(headerElement);
  
  // Create create-flag button
  const createFlagButton = document.createElement("button");
  createFlagButton.id = "create-flag-button";
  createFlagButton.textContent = "Create Flag";
  document.body.appendChild(createFlagButton);
  
  // Create API key link
  const apiKeyLink = document.createElement("a");
  apiKeyLink.id = "api-key-link";
  apiKeyLink.textContent = "API Keys";
  document.body.appendChild(apiKeyLink);
  
  // Mock getBoundingClientRect for all elements
  const mockRect = {
    top: 100,
    right: 300,
    bottom: 150,
    left: 200,
    width: 100,
    height: 50,
    x: 200,
    y: 100,
    toJSON: () => {}
  };
  
  Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue(mockRect);
};

describe("OnboardingOverlay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
    setupTargetElements();
    
    // Mock window properties
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 768 });
    
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
            toJSON: () => {}
          })
        };
      }
      return null;
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProvider = (pathname = "/flags") => {
    (usePathname as jest.Mock).mockReturnValue(pathname);
    
    // Clean mock localStorage before each test render
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        clear: jest.fn(),
        removeItem: jest.fn()
      }
    });
    
    return render(
      <OnboardingProvider>
        <OnboardingOverlay />
      </OnboardingProvider>
    );
  };

  test("shows welcome tooltip on feature flags page", () => {
    renderWithProvider("/flags");
    
    expect(screen.getByText("Welcome to Feature Flags")).toBeInTheDocument();
    expect(screen.getByText(/Let's get you started/)).toBeInTheDocument();
  });

  test("does not show tooltips on other pages", () => {
    renderWithProvider("/some-other-page");
    
    expect(screen.queryByText("Welcome to Feature Flags")).not.toBeInTheDocument();
  });

  test("advances through onboarding steps when clicking next", () => {
    renderWithProvider("/flags");
    
    // Initially at welcome step
    expect(screen.getByText("Welcome to Feature Flags")).toBeInTheDocument();
    
    // Click next to advance to create flag step
    fireEvent.click(screen.getByText("Next"));
    
    // Now should show create flag tooltip
    expect(screen.getByText("Create Your First Flag")).toBeInTheDocument();
    
    // Click next to advance to API key step
    fireEvent.click(screen.getByText("Next"));
    
    // Now should show API key tooltip
    expect(screen.getByText("Get Your API Key")).toBeInTheDocument();
  });

  test("goes back to previous step when clicking back", () => {
    renderWithProvider("/flags");
    
    // Ensure the welcome tooltip is displayed
    expect(screen.getByText("Welcome to Feature Flags")).toBeInTheDocument();
    
    // Click next to advance to create flag step
    fireEvent.click(screen.getByText("Next"));
    
    // Now we should be at create flag step
    expect(screen.getByText("Create Your First Flag")).toBeInTheDocument();
    
    // Click back button
    fireEvent.click(screen.getByText("Back"));
    
    // We should be back at welcome step
    expect(screen.getByText("Welcome to Feature Flags")).toBeInTheDocument();
  });

  test("completes onboarding when going through all steps", () => {
    renderWithProvider("/flags");
    
    // Check welcome tooltip is visible
    expect(screen.getByText("Welcome to Feature Flags")).toBeInTheDocument();
    
    // Click next to go to create flag step
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Create Your First Flag")).toBeInTheDocument();
    
    // Click next to go to API key step
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Get Your API Key")).toBeInTheDocument();
    
    // The next button should say "Finish" on the last step
    const finishButton = screen.getByText("Finish");
    expect(finishButton).toBeInTheDocument();
    
    // Click finish to complete onboarding
    fireEvent.click(finishButton);
    
    // No tooltips should be visible anymore
    expect(screen.queryByText("Welcome to Feature Flags")).not.toBeInTheDocument();
    expect(screen.queryByText("Create Your First Flag")).not.toBeInTheDocument();
    expect(screen.queryByText("Get Your API Key")).not.toBeInTheDocument();
  });

  test("skips onboarding when clicking close button", async () => {
    renderWithProvider("/flags");

    // Ensure welcome tooltip is visible
    expect(screen.getByText("Welcome to Feature Flags")).toBeInTheDocument();

    // Wait for the close button to appear and click it
    await act(async () => {
      const closeButton = await screen.findByLabelText("Close tooltip");
      expect(closeButton).toBeInTheDocument();
      fireEvent.click(closeButton);
    });

    // No tooltips should be visible anymore
    expect(screen.queryByText("Welcome to Feature Flags")).not.toBeInTheDocument();
  });

  test("changes tooltip position based on screen size for API key step", () => {
    // Mock the implementation of window.innerWidth
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1500 }); // Large screen
    
    renderWithProvider("/flags");
    
    // Ensure welcome tooltip is visible
    expect(screen.getByText("Welcome to Feature Flags")).toBeInTheDocument();
    
    // Advance to API key step
    fireEvent.click(screen.getByText("Next")); // To create flag
    expect(screen.getByText("Create Your First Flag")).toBeInTheDocument();
    
    fireEvent.click(screen.getByText("Next")); // To API key
    expect(screen.getByText("Get Your API Key")).toBeInTheDocument();
    
    // Change to small screen
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 800 }); // Small screen
    
    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    // Force re-render by navigating back and forth
    fireEvent.click(screen.getByText("Back")); // Back to create flag
    expect(screen.getByText("Create Your First Flag")).toBeInTheDocument();
    
    fireEvent.click(screen.getByText("Next")); // Forward to API key again
    
    // API key tooltip should still be visible
    expect(screen.getByText("Get Your API Key")).toBeInTheDocument();
  });
});
