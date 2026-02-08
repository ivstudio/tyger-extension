import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    mockChrome,
    resetChromeMocks,
    triggerTabActivated,
    triggerTabUpdated,
    triggerWebNavigationCommitted,
} from '@/test/mocks/chrome';
import { MessageType } from '@/types/messages';

// Mock webextension-polyfill
vi.mock('webextension-polyfill', () => ({
    default: mockChrome,
}));

// We need to import the worker after mocking
describe('worker URL sync', () => {
    beforeEach(async () => {
        resetChromeMocks();
        vi.clearAllMocks();

        // Clear the module cache and re-import worker for each test
        vi.resetModules();
        await import('./index');
    });

    describe('tabs.onActivated listener', () => {
        it('should broadcast URL when tab is activated', async () => {
            await import('./index');

            mockChrome.tabs.query.mockResolvedValueOnce([
                {
                    id: 2,
                    windowId: 1,
                    active: true,
                    url: 'https://new-tab.com',
                    title: 'New Tab',
                },
            ]);

            triggerTabActivated({ tabId: 2, windowId: 1 });

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
                type: MessageType.CURRENT_URL_UPDATE,
                data: { url: 'https://new-tab.com' },
            });
        });

        it('should handle case when no active tab exists', async () => {
            await import('./index');

            // Record call count before triggering
            const callCountBefore =
                mockChrome.runtime.sendMessage.mock.calls.length;

            // broadcastCurrentUrl makes TWO queries - mock both to return empty
            mockChrome.tabs.query
                .mockResolvedValueOnce([]) // First query: currentWindow
                .mockResolvedValueOnce([]); // Second query: lastFocusedWindow

            triggerTabActivated({ tabId: 2, windowId: 1 });

            await new Promise(resolve => setTimeout(resolve, 10));

            // Check that no NEW url update messages were sent after the trigger
            const newCalls =
                mockChrome.runtime.sendMessage.mock.calls.slice(
                    callCountBefore
                );
            const urlUpdateCalls = newCalls.filter(
                (call: any) => call[0]?.type === MessageType.CURRENT_URL_UPDATE
            );

            expect(urlUpdateCalls.length).toBe(0);
        });
    });

    describe('tabs.onUpdated listener', () => {
        it('should send URL when active tab URL changes', async () => {
            await import('./index');

            mockChrome.tabs.query.mockResolvedValueOnce([
                {
                    id: 1,
                    windowId: 1,
                    active: true,
                    url: 'https://updated.com',
                    title: 'Updated',
                },
            ]);

            triggerTabUpdated(
                1,
                { url: 'https://updated.com' },
                {
                    id: 1,
                    windowId: 1,
                    active: true,
                    url: 'https://updated.com',
                    title: 'Updated',
                }
            );

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
                type: MessageType.CURRENT_URL_UPDATE,
                data: { url: 'https://updated.com' },
            });
        });

        it('should send URL when active tab load completes', async () => {
            await import('./index');

            mockChrome.tabs.query.mockResolvedValueOnce([
                {
                    id: 1,
                    windowId: 1,
                    active: true,
                    url: 'https://example.com',
                    title: 'Example',
                },
            ]);

            triggerTabUpdated(
                1,
                { status: 'complete' },
                {
                    id: 1,
                    windowId: 1,
                    active: true,
                    url: 'https://example.com',
                    title: 'Example',
                }
            );

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
                type: MessageType.CURRENT_URL_UPDATE,
                data: { url: 'https://example.com' },
            });
        });

        it('should ignore updates from inactive tabs', async () => {
            await import('./index');

            mockChrome.tabs.query.mockResolvedValueOnce([
                {
                    id: 2,
                    windowId: 1,
                    active: true,
                    url: 'https://active-tab.com',
                    title: 'Active',
                },
            ]);

            triggerTabUpdated(
                1,
                { url: 'https://inactive-tab.com' },
                {
                    id: 1,
                    windowId: 1,
                    active: false,
                    url: 'https://inactive-tab.com',
                    title: 'Inactive',
                }
            );

            await new Promise(resolve => setTimeout(resolve, 10));

            // Should not send URL from inactive tab
            const sendMessageCalls = mockChrome.runtime.sendMessage.mock.calls;
            const urlUpdateCalls = sendMessageCalls.filter(
                (call: any) => call[0]?.data?.url === 'https://inactive-tab.com'
            );
            expect(urlUpdateCalls.length).toBe(0);
        });

        it('should ignore updates without URL change or load complete', async () => {
            await import('./index');

            triggerTabUpdated(
                1,
                {},
                {
                    id: 1,
                    windowId: 1,
                    active: true,
                    url: 'https://example.com',
                    title: 'Example',
                }
            );

            await new Promise(resolve => setTimeout(resolve, 10));

            // Should not send message for non-URL/non-status changes
            expect(mockChrome.runtime.sendMessage).not.toHaveBeenCalled();
        });

        it('should use changeInfo.url when available', async () => {
            await import('./index');

            mockChrome.tabs.query.mockResolvedValueOnce([
                {
                    id: 1,
                    windowId: 1,
                    active: true,
                    url: 'https://new-url.com',
                    title: 'New',
                },
            ]);

            triggerTabUpdated(
                1,
                { url: 'https://new-url.com' },
                {
                    id: 1,
                    windowId: 1,
                    active: true,
                    url: 'https://old-url.com',
                    title: 'Old',
                }
            );

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
                type: MessageType.CURRENT_URL_UPDATE,
                data: { url: 'https://new-url.com' },
            });
        });

        it('should fall back to tab.url when changeInfo.url not available', async () => {
            await import('./index');

            mockChrome.tabs.query.mockResolvedValueOnce([
                {
                    id: 1,
                    windowId: 1,
                    active: true,
                    url: 'https://tab-url.com',
                    title: 'Tab',
                },
            ]);

            triggerTabUpdated(
                1,
                { status: 'complete' },
                {
                    id: 1,
                    windowId: 1,
                    active: true,
                    url: 'https://tab-url.com',
                    title: 'Tab',
                }
            );

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
                type: MessageType.CURRENT_URL_UPDATE,
                data: { url: 'https://tab-url.com' },
            });
        });
    });

    describe('webNavigation.onCommitted listener', () => {
        it('should send URL for active tab SPA navigation', async () => {
            await import('./index');

            mockChrome.tabs.query.mockResolvedValueOnce([
                {
                    id: 1,
                    windowId: 1,
                    active: true,
                    url: 'https://spa.com/page2',
                    title: 'SPA',
                },
            ]);

            triggerWebNavigationCommitted({
                tabId: 1,
                frameId: 0,
                url: 'https://spa.com/page2',
                transitionType: 'link',
            });

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
                type: MessageType.CURRENT_URL_UPDATE,
                data: { url: 'https://spa.com/page2' },
            });
        });

        it('should ignore navigation in iframes (frameId !== 0)', async () => {
            await import('./index');

            triggerWebNavigationCommitted({
                tabId: 1,
                frameId: 1,
                url: 'https://iframe.com',
            });

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockChrome.runtime.sendMessage).not.toHaveBeenCalled();
        });

        it('should ignore navigation in inactive tabs', async () => {
            await import('./index');

            mockChrome.tabs.query.mockResolvedValueOnce([
                {
                    id: 2,
                    windowId: 1,
                    active: true,
                    url: 'https://active.com',
                    title: 'Active',
                },
            ]);

            triggerWebNavigationCommitted({
                tabId: 1,
                frameId: 0,
                url: 'https://inactive.com',
            });

            await new Promise(resolve => setTimeout(resolve, 10));

            const sendMessageCalls = mockChrome.runtime.sendMessage.mock.calls;
            const urlUpdateCalls = sendMessageCalls.filter(
                (call: any) => call[0]?.data?.url === 'https://inactive.com'
            );
            expect(urlUpdateCalls.length).toBe(0);
        });
    });

    describe('port connections', () => {
        it('should broadcast current URL when app port connects', async () => {
            await import('./index');

            mockChrome.tabs.query.mockResolvedValueOnce([
                {
                    id: 1,
                    windowId: 1,
                    active: true,
                    url: 'https://current.com',
                    title: 'Current',
                },
            ]);

            // Simulate port connection
            const port = mockChrome.runtime.connect({ name: 'app' });

            // Trigger onConnect listener manually
            const onConnectListeners =
                (mockChrome.runtime as any).onConnect?.listeners || [];
            onConnectListeners.forEach((listener: any) => listener(port));

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
                type: MessageType.CURRENT_URL_UPDATE,
                data: { url: 'https://current.com' },
            });
        });

        it('should send URL to all connected ports', async () => {
            await import('./index');

            const port1 = mockChrome.runtime.connect({ name: 'app' });
            const port2 = mockChrome.runtime.connect({ name: 'app' });

            mockChrome.tabs.query.mockResolvedValueOnce([
                {
                    id: 1,
                    windowId: 1,
                    active: true,
                    url: 'https://broadcast.com',
                    title: 'Broadcast',
                },
            ]);

            triggerTabActivated({ tabId: 1, windowId: 1 });

            await new Promise(resolve => setTimeout(resolve, 10));

            // Both ports should receive the message
            expect(port1.postMessage).toHaveBeenCalledWith({
                type: MessageType.CURRENT_URL_UPDATE,
                data: { url: 'https://broadcast.com' },
            });
            expect(port2.postMessage).toHaveBeenCalledWith({
                type: MessageType.CURRENT_URL_UPDATE,
                data: { url: 'https://broadcast.com' },
            });
        });
    });
});
