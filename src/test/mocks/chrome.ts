import { vi } from 'vitest';

// Storage for mock data
const storageData: Record<string, unknown> = {};

// Store runtime message listeners
const runtimeMessageListeners: Array<
    (message: any, sender: any, sendResponse: any) => void
> = [];

// Store created ports for testing
const mockPorts: Array<{
    name?: string;
    postMessage: any;
    onMessage: { addListener: any; removeListener: any };
    onDisconnect: { addListener: any; removeListener: any };
    disconnect: any;
}> = [];

// Store onConnect listeners
const runtimeOnConnectListeners: Array<(port: any) => void> = [];

// Mock chrome.runtime
export const mockRuntime = {
    sendMessage: vi.fn((_message, callback?) => {
        if (callback) callback({ success: true });
        return Promise.resolve({ success: true });
    }),
    onMessage: {
        addListener: vi.fn((listener: any) => {
            runtimeMessageListeners.push(listener);
        }),
        removeListener: vi.fn((listener: any) => {
            const index = runtimeMessageListeners.indexOf(listener);
            if (index > -1) runtimeMessageListeners.splice(index, 1);
        }),
        hasListener: vi.fn(),
    },
    onConnect: {
        addListener: vi.fn((listener: (port: any) => void) => {
            runtimeOnConnectListeners.push(listener);
        }),
        removeListener: vi.fn((listener: (port: any) => void) => {
            const index = runtimeOnConnectListeners.indexOf(listener);
            if (index > -1) runtimeOnConnectListeners.splice(index, 1);
        }),
    },
    onInstalled: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
    },
    connect: vi.fn((connectInfo?: { name?: string }) => {
        const portMessageListeners: Array<(message: any) => void> = [];
        const portDisconnectListeners: Array<() => void> = [];

        const port = {
            name: connectInfo?.name,
            postMessage: vi.fn((message: any) => {
                // Simulate message being sent
            }),
            onMessage: {
                addListener: vi.fn((listener: (message: any) => void) => {
                    portMessageListeners.push(listener);
                }),
                removeListener: vi.fn((listener: (message: any) => void) => {
                    const index = portMessageListeners.indexOf(listener);
                    if (index > -1) portMessageListeners.splice(index, 1);
                }),
                _trigger: (message: any) => {
                    portMessageListeners.forEach(listener => listener(message));
                },
            },
            onDisconnect: {
                addListener: vi.fn((listener: () => void) => {
                    portDisconnectListeners.push(listener);
                }),
                removeListener: vi.fn((listener: () => void) => {
                    const index = portDisconnectListeners.indexOf(listener);
                    if (index > -1) portDisconnectListeners.splice(index, 1);
                }),
                _trigger: () => {
                    portDisconnectListeners.forEach(listener => listener());
                },
            },
            disconnect: vi.fn(() => {
                portDisconnectListeners.forEach(listener => listener());
            }),
        };

        mockPorts.push(port);

        // Trigger onConnect listeners
        runtimeOnConnectListeners.forEach(listener => listener(port));

        return port;
    }),
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

// Store event listeners for triggering
const tabsOnActivatedListeners: Array<(activeInfo: any) => void> = [];
const tabsOnUpdatedListeners: Array<
    (tabId: number, changeInfo: any, tab: any) => void
> = [];

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
    onActivated: {
        addListener: vi.fn((listener: (activeInfo: any) => void) => {
            tabsOnActivatedListeners.push(listener);
        }),
        removeListener: vi.fn((listener: (activeInfo: any) => void) => {
            const index = tabsOnActivatedListeners.indexOf(listener);
            if (index > -1) tabsOnActivatedListeners.splice(index, 1);
        }),
    },
    onUpdated: {
        addListener: vi.fn(
            (listener: (tabId: number, changeInfo: any, tab: any) => void) => {
                tabsOnUpdatedListeners.push(listener);
            }
        ),
        removeListener: vi.fn(
            (listener: (tabId: number, changeInfo: any, tab: any) => void) => {
                const index = tabsOnUpdatedListeners.indexOf(listener);
                if (index > -1) tabsOnUpdatedListeners.splice(index, 1);
            }
        ),
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

// Mock chrome.action
export const mockAction = {
    onClicked: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
    },
    setTitle: vi.fn((_options, callback?) => {
        if (callback) callback();
        return Promise.resolve();
    }),
    setIcon: vi.fn((_options, callback?) => {
        if (callback) callback();
        return Promise.resolve();
    }),
};

// Store webNavigation listeners
const webNavigationOnCommittedListeners: Array<(details: any) => void> = [];

// Mock chrome.webNavigation
export const mockWebNavigation = {
    onCommitted: {
        addListener: vi.fn((listener: (details: any) => void) => {
            webNavigationOnCommittedListeners.push(listener);
        }),
        removeListener: vi.fn((listener: (details: any) => void) => {
            const index = webNavigationOnCommittedListeners.indexOf(listener);
            if (index > -1) webNavigationOnCommittedListeners.splice(index, 1);
        }),
    },
};

// Combined chrome mock
export const mockChrome = {
    runtime: mockRuntime,
    storage: mockStorage,
    tabs: mockTabs,
    windows: mockWindows,
    sidePanel: mockSidePanel,
    webNavigation: mockWebNavigation,
    action: mockAction,
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

    // Clear event listeners
    tabsOnActivatedListeners.length = 0;
    tabsOnUpdatedListeners.length = 0;
    webNavigationOnCommittedListeners.length = 0;
    runtimeMessageListeners.length = 0;
    runtimeOnConnectListeners.length = 0;
    mockPorts.length = 0;

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

// Helper functions to trigger events
export function triggerTabActivated(activeInfo: {
    tabId: number;
    windowId: number;
}) {
    tabsOnActivatedListeners.forEach(listener => listener(activeInfo));
}

export function triggerTabUpdated(
    tabId: number,
    changeInfo: { url?: string; status?: string },
    tab: any
) {
    tabsOnUpdatedListeners.forEach(listener =>
        listener(tabId, changeInfo, tab)
    );
}

export function triggerWebNavigationCommitted(details: {
    tabId: number;
    frameId: number;
    url: string;
    transitionType?: string;
}) {
    webNavigationOnCommittedListeners.forEach(listener => listener(details));
}

// Utility to pre-populate storage
export function mockChromeStorage(data: Record<string, unknown>) {
    Object.assign(storageData, data);
}

// Export storage data for testing
export function getChromeStorageData() {
    return { ...storageData };
}

// Helper to trigger runtime.onMessage listeners
export function triggerRuntimeMessage(message: any, sender?: any) {
    const mockSender = sender || { tab: { id: 1 }, id: 'mock-extension-id' };
    const sendResponse = vi.fn();
    runtimeMessageListeners.forEach(listener =>
        listener(message, mockSender, sendResponse)
    );
    return sendResponse;
}

// Get all created ports (for testing)
export function getMockPorts() {
    return mockPorts;
}

// Get the most recently created port
export function getLastMockPort() {
    return mockPorts[mockPorts.length - 1];
}
