import type { Config } from 'jest'

const customJestConfig: Config = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],

  collectCoverage: true,
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  clearMocks: true,
}

export default customJestConfig
