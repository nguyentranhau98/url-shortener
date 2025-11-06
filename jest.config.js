/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',

    // Updated for Jest 29
    roots: ['<rootDir>/app'],
    testMatch: [
        '**/__tests__/**/*.ts',
        '**/?(*.)+(spec|test).ts',
    ],

    // Module name mapping
    moduleNameMapper: {
        '@exmpl/(.*)': '<rootDir>/$1',
    },

    // Coverage configuration
    collectCoverageFrom: [
        'app/src/**/*.ts',
        '!app/src/**/*.spec.ts',
        '!app/src/**/tests/**',
    ],

    // Improved error handling
    errorOnDeprecated: true,

    // Transform configuration for ts-jest 29
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: {
                esModuleInterop: true,
            },
        }],
    },
};