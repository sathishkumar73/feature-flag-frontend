import { render, screen, fireEvent, act } from "@testing-library/react";
import FeatureFlagsPage from "@/app/flags/page";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import React from "react";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn().mockReturnValue("/flags"),
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn()
  }),
}));

// Mock the useFeatureFlags hook
jest.mock("@/hooks/useFeatureFlags", () => ({
  useFeatureFlags: jest.fn(),
}));

// Helper to setup DOM elements needed for onboarding
const setupDomElements = () => {
  // Create elements that will be targeted by tooltips
  const headerElement = document.createElement("div");
  headerElement.id = "feature-flags-header";
  document.body.appendChild(headerElement);
  
  const createFlagButton = document.createElement("button");
  createFlagButton.id = "create-flag-button";
  document.body.appendChild(createFlagButton);
  
  const apiKeyLink = document.createElement("a");
  apiKeyLink.id = "api-key-link";
  document.body.appendChild(apiKeyLink);
  
  // Mock getBoundingClientRect for elements
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
  
  Element.prototype.getBoundingClientRect = jest.fn().mockImplementation(() => mockRect);
  
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
        }),
        closest: () => true
      };
    }
    return null;
  });
  
  // Mock window properties
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
  Object.defineProperty(window, 'innerHeight', { writable: true, value: 768 });
  window.scrollX = 0;
  window.scrollY = 0;
  
  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
    removeItem: jest.fn(),
    length: 0,
    key: jest.fn()
  };
  Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
};

describe("FeatureFlagsPage with Onboarding", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    document.body.innerHTML = '';
    setupDomElements();
    
    // Mock the useFeatureFlags hook
    (useFeatureFlags as jest.Mock).mockReturnValue({
      searchTerm: "",
      setSearchTerm: jest.fn(),
      environmentFilter: "all",
      setEnvironmentFilter: jest.fn(),
      statusFilter: "all",
      setStatusFilter: jest.fn(),
      sortField: "name",
      sortDirection: "asc",
      handleSort: jest.fn(),
      paginatedFlags: [],
      filteredAndSortedFlags: [],
      currentPage: 1,
      totalPages: 1,
      goToNextPage: jest.fn(),
      goToPreviousPage: jest.fn(),
      handleCreateFlag: jest.fn(),
      handleToggleFlag: jest.fn(),
      isLoadingFlags: false,
      isAuthLoading: false,
      error: null,
      isCreatingFlag: false,
      isTogglingFlagId: null,
      userAccessToken: "mock-token"
    });
    
    // Mock localStorage to look like first visit
    localStorage.getItem = jest.fn().mockReturnValue(null);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });
  
  const renderPage = () => {
    return render(
      <OnboardingProvider>
        <FeatureFlagsPage />
      </OnboardingProvider>
    );
  };

  test("shows onboarding welcome tooltip on first visit", () => {
    renderPage();
    
    expect(screen.getByText("Welcome to Feature Flags")).toBeInTheDocument();
    expect(screen.getByText(/Let's get you started/)).toBeInTheDocument();
  });

  test("doesn't show onboarding if already completed", () => {
    // Mock localStorage to indicate onboarding is already completed
    localStorage.getItem = jest.fn().mockImplementation((key) => {
      if (key === "onboardingComplete") return "true";
      if (key === "onboardingStep") return "3"; // COMPLETED step
      return null;
    });
    
    // Render and wait for localStorage values to be applied
    act(() => {
      renderPage();
    });
    
    // Wait a bit for any async state updates
    act(() => {
      jest.runAllTimers();
    });
    
    // Verify no onboarding tooltips are shown
    expect(screen.queryByText("Welcome to Feature Flags")).not.toBeInTheDocument();
  });
  
  test("persists onboarding state across page refreshes", () => {
    // Simulate a previous session where user reached step 1
    localStorage.getItem = jest.fn().mockImplementation((key) => {
      if (key === "onboardingComplete") return "false";
      if (key === "onboardingStep") return "1"; // CREATE_FLAG step
      return null;
    });
    
    // Render the page (simulating page refresh)
    act(() => {
      renderPage();
    });
    
    // Should show step 1 tooltip (Create Flag) instead of welcome
    expect(screen.queryByText("Welcome to Feature Flags")).not.toBeInTheDocument();
    expect(screen.getByText("Create Your First Flag")).toBeInTheDocument();
  });

  test("onboarding reset button shows dialog when clicked", () => {
    // Mock localStorage to indicate onboarding is already completed
    localStorage.getItem = jest.fn().mockImplementation((key) => {
      if (key === "onboardingComplete") return "true";
      if (key === "onboardingStep") return "3"; // COMPLETED step
      return null;
    });
    
    renderPage();
    
    // Find and click the reset button
    fireEvent.click(screen.getByText("Show onboarding tour"));
    
    // Check if dialog appears
    expect(screen.getByText("Restart Onboarding Tour")).toBeInTheDocument();
    expect(screen.getByText(/Would you like to restart the onboarding tour?/)).toBeInTheDocument();
  });

  test("completes full onboarding flow", () => {
    renderPage();
    
    // Check welcome tooltip is visible
    expect(screen.getByText("Welcome to Feature Flags")).toBeInTheDocument();
    
    // Click next to go to create flag step
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Create Your First Flag")).toBeInTheDocument();
    
    // Click next to go to documentation step
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Explore Documentation")).toBeInTheDocument();
    
    // Click next to go to API key step
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Get Your API Key")).toBeInTheDocument();
    
    // Click finish to complete onboarding
    fireEvent.click(screen.getByText("Finish"));
    
    // No tooltips should be visible anymore
    expect(screen.queryByText("Welcome to Feature Flags")).not.toBeInTheDocument();
    expect(screen.queryByText("Create Your First Flag")).not.toBeInTheDocument();
    expect(screen.queryByText("Explore Documentation")).not.toBeInTheDocument();
    expect(screen.queryByText("Get Your API Key")).not.toBeInTheDocument();
    
    // LocalStorage should be updated
    expect(localStorage.setItem).toHaveBeenCalledWith("onboardingComplete", "true");
    expect(localStorage.setItem).toHaveBeenCalledWith("onboardingStep", "4");
  });

  test("onboarding tooltips respond to screen size changes", () => {
    renderPage();
    
    // Go to documentation step
    fireEvent.click(screen.getByText("Next")); // To create flag
    fireEvent.click(screen.getByText("Next")); // To documentation
    fireEvent.click(screen.getByText("Next")); // To API key
    
    // Simulate resize to large screen
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1500 });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    // API key tooltip should still be visible
    expect(screen.getByText("Get Your API Key")).toBeInTheDocument();
    
    // Simulate resize to small screen
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 800 });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    // API key tooltip should still be visible
    expect(screen.getByText("Get Your API Key")).toBeInTheDocument();
  });
});
