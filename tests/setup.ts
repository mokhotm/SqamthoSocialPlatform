// tests/setup.ts
import { jest } from '@jest/globals';

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-secret';

// Global test setup
beforeAll(async () => {
  // Any global setup
});

afterAll(async () => {
  // Any global cleanup
});
