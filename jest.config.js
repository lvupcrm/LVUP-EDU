const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './apps/web',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Test environment setup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  
  // Module paths
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/apps/web/src/$1',
    '^@api/(.*)$': '<rootDir>/apps/api/src/$1',
    '^@shared/(.*)$': '<rootDir>/packages/shared/$1',
  },
  
  // Test patterns
  testMatch: [
    '<rootDir>/apps/web/**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)',
    '<rootDir>/apps/api/**/__tests__/**/*.(test|spec).(ts|js)',
    '<rootDir>/packages/**/__tests__/**/*.(test|spec).(ts|js)',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'apps/web/src/**/*.{ts,tsx}',
    'apps/api/src/**/*.{ts}',
    'packages/**/*.{ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/.next/**',
    '!**/dist/**',
    '!**/build/**',
  ],
  
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
    // 중요한 모듈들에는 더 높은 커버리지 요구
    'apps/web/src/lib/**/*.{ts,tsx}': {
      branches: 85,
      functions: 85,
      lines: 90,
      statements: 90,
    },
    'apps/api/src/modules/**/*.{ts}': {
      branches: 85,
      functions: 85,
      lines: 90,
      statements: 90,
    },
  },
  
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  coverageDirectory: '<rootDir>/coverage',
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/apps/web/.next/',
    '<rootDir>/apps/api/dist/',
    '<rootDir>/coverage/',
  ],
  
  // Global setup and teardown
  globalSetup: '<rootDir>/jest.global-setup.js',
  globalTeardown: '<rootDir>/jest.global-teardown.js',
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Projects for different test types
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: ['<rootDir>/**/*.unit.(test|spec).(ts|tsx|js|jsx)'],
      testEnvironment: 'jest-environment-jsdom',
    },
    {
      displayName: 'Integration Tests', 
      testMatch: ['<rootDir>/**/*.integration.(test|spec).(ts|tsx|js|jsx)'],
      testEnvironment: 'jest-environment-node',
    },
    {
      displayName: 'API Tests',
      testMatch: ['<rootDir>/apps/api/**/*.(test|spec).ts'],
      testEnvironment: 'jest-environment-node',
    },
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);