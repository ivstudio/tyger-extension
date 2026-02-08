import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    mockChrome,
    resetChromeMocks,
    getLastMockPort,
} from '@/test/mocks/chrome';
import { MessageType } from '@/types/messages';

// Mock webextension-polyfill
vi.mock('webextension-polyfill', () => ({
    default: mockChrome,
}));

// Mock the context to avoid provider complexity
vi.mock('@/app/context/useScanContext', () => ({
    useScanDispatch: () => vi.fn(),
}));

// Import after mocks
import { useTabUrlSync } from './useTabUrlSync';
import { renderHook } from '@testing-library/react';

describe('useTabUrlSync', () => {
    beforeEach(() => {
        resetChromeMocks();
        vi.clearAllMocks();
    });

    describe('initialization', () => {
        it('should connect to runtime with "app" name', () => {
            renderHook(() => useTabUrlSync());

            expect(mockChrome.runtime.connect).toHaveBeenCalledWith({
                name: 'app',
            });
        });

        it('should send GET_CURRENT_URL message on mount', () => {
            renderHook(() => useTabUrlSync());

            expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
                type: MessageType.GET_CURRENT_URL,
            });
        });

        it('should add listener to port.onMessage', () => {
            renderHook(() => useTabUrlSync());

            const port = getLastMockPort();
            expect(port.onMessage.addListener).toHaveBeenCalled();
        });
    });

    describe('cleanup', () => {
        it('should disconnect port on unmount', () => {
            const { unmount } = renderHook(() => useTabUrlSync());

            const port = getLastMockPort();

            unmount();

            expect(port.disconnect).toHaveBeenCalled();
        });

        it('should remove port.onMessage listener on unmount', () => {
            const { unmount } = renderHook(() => useTabUrlSync());

            const port = getLastMockPort();

            unmount();

            expect(port.onMessage.removeListener).toHaveBeenCalled();
        });
    });

    describe('port message handling', () => {
        it('should add message listener to port', () => {
            renderHook(() => useTabUrlSync());

            const port = getLastMockPort();

            expect(port.onMessage.addListener).toHaveBeenCalled();
        });

        it('should handle URL updates via port without crashing', () => {
            renderHook(() => useTabUrlSync());

            const port = getLastMockPort();

            // Trigger message (should not crash)
            expect(() => {
                (port.onMessage as any)._trigger({
                    type: MessageType.CURRENT_URL_UPDATE,
                    data: { url: 'https://test.com' },
                });
            }).not.toThrow();
        });
    });

    describe('error handling', () => {
        it('should handle sendMessage failure gracefully', () => {
            mockChrome.runtime.sendMessage.mockRejectedValueOnce(
                new Error('Failed')
            );

            expect(() => {
                renderHook(() => useTabUrlSync());
            }).not.toThrow();
        });
    });
});
