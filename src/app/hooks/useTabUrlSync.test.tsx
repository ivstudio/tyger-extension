import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    mockChrome,
    resetChromeMocks,
    getLastMockPort,
    triggerRuntimeMessage,
} from '@/test/mocks/chrome';
import { MessageType } from '@/types/messages';

const mockDispatch = vi.fn();

vi.mock('webextension-polyfill', () => ({
    default: mockChrome,
}));

vi.mock('@/app/context/useScanContext', () => ({
    useScanDispatch: () => mockDispatch,
}));

import { useTabUrlSync } from './useTabUrlSync';
import { renderHook } from '@testing-library/react';

describe('useTabUrlSync', () => {
    beforeEach(() => {
        resetChromeMocks();
        vi.clearAllMocks();
        mockDispatch.mockClear();
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

        it('should dispatch SET_CURRENT_URL when port receives URL', () => {
            renderHook(() => useTabUrlSync());

            const port = getLastMockPort();
            (port.onMessage as any)._trigger({
                type: MessageType.CURRENT_URL_UPDATE,
                data: { url: 'https://first.com' },
            });

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_CURRENT_URL',
                payload: 'https://first.com',
            });
        });

        it('should dispatch RESET when URL changes (port receives different URL)', () => {
            renderHook(() => useTabUrlSync());

            const port = getLastMockPort();
            (port.onMessage as any)._trigger({
                type: MessageType.CURRENT_URL_UPDATE,
                data: { url: 'https://first.com' },
            });
            mockDispatch.mockClear();

            (port.onMessage as any)._trigger({
                type: MessageType.CURRENT_URL_UPDATE,
                data: { url: 'https://second.com' },
            });

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'RESET' });
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_CURRENT_URL',
                payload: 'https://second.com',
            });
        });
    });

    describe('runtime onMessage handling', () => {
        it('should apply URL when CURRENT_URL_UPDATE received via runtime.onMessage', () => {
            renderHook(() => useTabUrlSync());

            triggerRuntimeMessage({
                type: MessageType.CURRENT_URL_UPDATE,
                data: { url: 'https://runtime-url.com' },
            });

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_CURRENT_URL',
                payload: 'https://runtime-url.com',
            });
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
