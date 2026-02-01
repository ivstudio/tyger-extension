import '@testing-library/jest-dom';
import { afterEach, vi, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { resetChromeMocks } from './mocks/chrome';

// Cleanup after each test
afterEach(() => {
    cleanup();
    resetChromeMocks();
    vi.clearAllMocks();
});

// Suppress console errors in tests (optional)
const originalError = console.error;
beforeAll(() => {
    console.error = (...args: unknown[]) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes(
                'Not implemented: HTMLFormElement.prototype.submit'
            ) ||
                args[0].includes('Not implemented'))
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
