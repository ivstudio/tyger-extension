import { vi } from 'vitest';

// Storage for mock data
const storageData: Record<string, unknown> = {};

// Mock chrome.runtime
export const mockRuntime = {
    sendMessage: vi.fn((_message, callback?) => {
        if (callback) callback({ success: true });
        return Promise.resolve({ success: true });
    }),
    onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
        hasListener: vi.fn(),
    },
    connect: vi.fn(() => ({
        postMessage: vi.fn(),
        onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
        onDisconnect: { addListener: vi.fn(), removeListener: vi.fn() },
        disconnect: vi.fn(),
    })),
    getURL: vi.fn((path: string) => `chrome-extension://mock-id/${path}`),
    id: 'mock-extension-id',
};

// Mock chrome.storage.local
export const mockStorageLocal = {
    get: vi.fn((keys?, callback?) => {
        const result =
            typeof keys === 'string'
                ? { [keys]: storageData[keys] }
                : keys
                  ? Object.fromEntries(
                        keys.map((k: string) => [k, storageData[k]])
                    )
                  : { ...storageData };

        if (callback) callback(result);
        return Promise.resolve(result);
    }),
    set: vi.fn((items, callback?) => {
        Object.assign(storageData, items);
        if (callback) callback();
        return Promise.resolve();
    }),
    remove: vi.fn((keys, callback?) => {
        const keysArray = typeof keys === 'string' ? [keys] : keys;
        keysArray.forEach((key: string) => delete storageData[key]);
        if (callback) callback();
        return Promise.resolve();
    }),
    clear: vi.fn((callback?) => {
        Object.keys(storageData).forEach(key => delete storageData[key]);
        if (callback) callback();
        return Promise.resolve();
    }),
    getBytesInUse: vi.fn((_keys?, callback?) => {
        const bytes = JSON.stringify(storageData).length;
        if (callback) callback(bytes);
        return Promise.resolve(bytes);
    }),
};

// Mock chrome.storage
export const mockStorage = {
    local: mockStorageLocal,
    sync: { ...mockStorageLocal },
    session: { ...mockStorageLocal },
    onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
    },
};

// Mock chrome.tabs
export const mockTabs = {
    query: vi.fn((_queryInfo, callback?) => {
        const tabs = [
            {
                id: 1,
                windowId: 1,
                active: true,
                url: 'https://example.com',
                title: 'Example',
            },
        ];
        if (callback) callback(tabs);
        return Promise.resolve(tabs);
    }),
    sendMessage: vi.fn((_tabId, _message, callback?) => {
        if (callback) callback({ success: true });
        return Promise.resolve({ success: true });
    }),
    onUpdated: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
    },
    get: vi.fn((tabId, callback?) => {
        const tab = {
            id: tabId,
            windowId: 1,
            active: true,
            url: 'https://example.com',
            title: 'Example',
        };
        if (callback) callback(tab);
        return Promise.resolve(tab);
    }),
};

// Mock chrome.windows
export const mockWindows = {
    getCurrent: vi.fn((callback?) => {
        const window = { id: 1, focused: true, type: 'normal' as const };
        if (callback) callback(window);
        return Promise.resolve(window);
    }),
};

// Mock chrome.sidePanel
export const mockSidePanel = {
    open: vi.fn((_options, callback?) => {
        if (callback) callback();
        return Promise.resolve();
    }),
    setOptions: vi.fn((_options, callback?) => {
        if (callback) callback();
        return Promise.resolve();
    }),
    setPanelBehavior: vi.fn((_behavior, callback?) => {
        if (callback) callback();
        return Promise.resolve();
    }),
};

// Combined chrome mock
export const mockChrome = {
    runtime: mockRuntime,
    storage: mockStorage,
    tabs: mockTabs,
    windows: mockWindows,
    sidePanel: mockSidePanel,
};

// Setup global chrome and browser objects
if (typeof globalThis !== 'undefined') {
    (globalThis as any).chrome = mockChrome;
    (globalThis as any).browser = mockChrome; // For webextension-polyfill compatibility
}

// Reset function to clear all mocks
export function resetChromeMocks() {
    // Clear storage data
    Object.keys(storageData).forEach(key => delete storageData[key]);

    // Clear all mock calls
    Object.values(mockChrome).forEach(api => {
        Object.values(api).forEach(method => {
            if (typeof method === 'function' && 'mockClear' in method) {
                (method as any).mockClear();
            } else if (typeof method === 'object' && method !== null) {
                Object.values(method).forEach(subMethod => {
                    if (
                        typeof subMethod === 'function' &&
                        'mockClear' in subMethod
                    ) {
                        (subMethod as any).mockClear();
                    }
                });
            }
        });
    });
}

// Utility to pre-populate storage
export function mockChromeStorage(data: Record<string, unknown>) {
    Object.assign(storageData, data);
}

// Export storage data for testing
export function getChromeStorageData() {
    return { ...storageData };
}
