import { vi } from 'vitest';

/**
 * Wait for a condition to be true
 */
export async function waitFor(
    condition: () => boolean,
    timeout = 1000,
    interval = 50
): Promise<void> {
    const startTime = Date.now();
    while (!condition()) {
        if (Date.now() - startTime > timeout) {
            throw new Error('Timeout waiting for condition');
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
}

/**
 * Create a deferred promise
 */
export function createDeferred<T>() {
    let resolve: (value: T) => void;
    let reject: (error: Error) => void;

    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve: resolve!, reject: reject! };
}

/**
 * Flush all pending promises
 */
export async function flushPromises() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Mock localStorage
 */
export function mockLocalStorage() {
    const store: Record<string, string> = {};

    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            Object.keys(store).forEach(key => delete store[key]);
        }),
        get length() {
            return Object.keys(store).length;
        },
        key: vi.fn((index: number) => {
            const keys = Object.keys(store);
            return keys[index] || null;
        }),
    };
}

/**
 * Create a mock file
 */
export function createMockFile(
    content: string,
    filename: string,
    mimeType = 'text/plain'
): File {
    const blob = new Blob([content], { type: mimeType });
    return new File([blob], filename, { type: mimeType });
}

/**
 * Suppress console methods during tests
 */
export function suppressConsole(
    methods: Array<keyof Console> = ['error', 'warn']
) {
    const original: Partial<Record<keyof Console, any>> = {};

    methods.forEach(method => {
        original[method] = console[method];
        console[method] = vi.fn();
    });

    return () => {
        methods.forEach(method => {
            console[method] = original[method];
        });
    };
}
