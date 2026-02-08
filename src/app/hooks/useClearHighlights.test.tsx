import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { ScanProvider } from '../context/ScanContext';
import { useClearHighlights } from './useClearHighlights';
import { useScanDispatch } from '../context/useScanContext';
import * as messaging from '@/services/messaging';
import { MessageType } from '@/types/messages';
import { createMockScanResult } from '@/test/fixtures/scanResults';

// Mock the messaging service
vi.mock('@/services/messaging', () => ({
    sendMessage: vi.fn(),
}));

// Wrapper component for hooks that need ScanProvider
function wrapper({ children }: { children: ReactNode }) {
    return <ScanProvider>{children}</ScanProvider>;
}

describe('useClearHighlights', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should clear highlights when scan starts', () => {
        const { result, rerender } = renderHook(
            () => {
                const dispatch = useScanDispatch();
                useClearHighlights();
                return { dispatch };
            },
            { wrapper }
        );

        // Start a scan
        result.current.dispatch({ type: 'SCAN_START' });
        rerender();

        // Should have sent clear message
        expect(messaging.sendMessage).toHaveBeenCalledWith({
            type: MessageType.CLEAR_HIGHLIGHTS,
        });
    });

    it('should clear highlights when URL changes', () => {
        const { result, rerender } = renderHook(
            () => {
                const dispatch = useScanDispatch();
                useClearHighlights();
                return { dispatch };
            },
            { wrapper }
        );

        // First scan
        result.current.dispatch({
            type: 'SCAN_COMPLETE',
            payload: createMockScanResult({
                url: 'https://example.com/page1',
            }),
        });
        rerender();

        vi.clearAllMocks();

        // Second scan with different URL
        result.current.dispatch({
            type: 'SCAN_COMPLETE',
            payload: createMockScanResult({
                url: 'https://example.com/page2',
            }),
        });
        rerender();

        // Should have sent clear message when URL changed
        expect(messaging.sendMessage).toHaveBeenCalledWith({
            type: MessageType.CLEAR_HIGHLIGHTS,
        });
    });

    it('should NOT clear highlights when URL stays the same', () => {
        const { result, rerender } = renderHook(
            () => {
                const dispatch = useScanDispatch();
                useClearHighlights();
                return { dispatch };
            },
            { wrapper }
        );

        // First scan
        result.current.dispatch({
            type: 'SCAN_COMPLETE',
            payload: createMockScanResult({
                url: 'https://example.com/page1',
            }),
        });
        rerender();

        vi.clearAllMocks();

        // Second scan with SAME URL
        result.current.dispatch({
            type: 'SCAN_COMPLETE',
            payload: createMockScanResult({
                url: 'https://example.com/page1',
                timestamp: Date.now() + 1000,
            }),
        });
        rerender();

        // Should NOT have sent clear message (same URL, just re-scan)
        expect(messaging.sendMessage).not.toHaveBeenCalled();
    });

    it('should clear highlights when view mode changes', () => {
        const { result, rerender } = renderHook(
            () => {
                const dispatch = useScanDispatch();
                useClearHighlights();
                return { dispatch };
            },
            { wrapper }
        );

        // Initial render establishes the initial viewMode
        rerender();
        vi.clearAllMocks();

        // Switch to checklist view
        result.current.dispatch({
            type: 'SET_VIEW_MODE',
            payload: 'checklist',
        });
        rerender();

        // Should have sent clear message
        expect(messaging.sendMessage).toHaveBeenCalledWith({
            type: MessageType.CLEAR_HIGHLIGHTS,
        });

        vi.clearAllMocks();

        // Switch back to issues view
        result.current.dispatch({
            type: 'SET_VIEW_MODE',
            payload: 'issues',
        });
        rerender();

        // Should have sent clear message again
        expect(messaging.sendMessage).toHaveBeenCalledWith({
            type: MessageType.CLEAR_HIGHLIGHTS,
        });
    });

    it('should handle multiple triggers independently', () => {
        const { result, rerender } = renderHook(
            () => {
                const dispatch = useScanDispatch();
                useClearHighlights();
                return { dispatch };
            },
            { wrapper }
        );

        // Start scan
        result.current.dispatch({ type: 'SCAN_START' });
        rerender();

        expect(messaging.sendMessage).toHaveBeenCalledTimes(1);

        // Complete scan
        result.current.dispatch({
            type: 'SCAN_COMPLETE',
            payload: createMockScanResult({
                url: 'https://example.com',
            }),
        });
        rerender();

        // Should still be 1 (URL didn't change, it's first scan)
        expect(messaging.sendMessage).toHaveBeenCalledTimes(1);
    });
});
