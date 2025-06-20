require('@testing-library/jest-dom');

// Mock window.matchMedia for tests
if (!window.matchMedia) {
  window.matchMedia = function () {
    return {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      dispatchEvent: jest.fn(),
    };
  };
}
