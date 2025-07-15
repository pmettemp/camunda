// Jest setup file for Camunda tests

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Helper to create test policy data
  createTestPolicy: (overrides = {}) => ({
    policyData: {
      title: "Test Policy",
      category: "Test",
      content: "This is a test policy",
      riskLevel: "Low",
      authorId: "test-user",
      authorName: "Test User",
      ...overrides.policyData
    },
    policyAuthor: "test-user",
    ...overrides
  }),

  // Helper to wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to generate unique test IDs
  generateTestId: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
};

// Console log configuration for tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Suppress console.log in tests unless VERBOSE_TESTS is set
if (!process.env.VERBOSE_TESTS) {
  console.log = jest.fn();
}

// Always show console.error in tests
console.error = originalConsoleError;

// Cleanup function
afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
