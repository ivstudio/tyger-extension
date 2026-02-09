import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    mockChrome,
    resetChromeMocks,
    triggerRuntimeMessage,
} from '@/test/mocks/chrome';
import { MessageType } from '@/types/messages';
import { createMockScanResult } from '@/test/fixtures/scanResults';
import { renderHook, act } from '@testing-library/react';

const mockDispatch = vi.fn();

vi.mock('webextension-polyfill', () => ({
    default: mockChrome,
}));

vi.mock('@/app/context/useScanContext', () => ({
    useScanDispatch: () => mockDispatch,
}));

import { useScanWithAnimation } from './useScanWithAnimation';

describe('useScanWithAnimation', () => {
    beforeEach(() => {
        resetChromeMocks();
        vi.clearAllMocks();
        mockDispatch.mockClear();
    });

    describe('handleScan', () => {
        it('should dispatch SCAN_START and send SCAN_REQUEST', async () => {
            const { result } = renderHook(() => useScanWithAnimation());

            await act(async () => {
                await result.current.handleScan();
            });

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SCAN_START',
                payload: 'https://example.com',
            });
            expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: MessageType.SCAN_REQUEST,
                    data: expect.objectContaining({
                        url: 'https://example.com',
                        runId: expect.any(String),
                    }),
                })
            );
        });

        it('should set isAnimating to true when scan starts', async () => {
            const { result } = renderHook(() => useScanWithAnimation());

            expect(result.current.isAnimating).toBe(false);

            await act(async () => {
                result.current.handleScan();
            });

            expect(result.current.isAnimating).toBe(true);
        });
    });

    describe('handleRefresh', () => {
        it('should dispatch RESET_AND_START_SCAN with tab url', async () => {
            const { result } = renderHook(() => useScanWithAnimation());

            await act(async () => {
                await result.current.handleRefresh();
            });

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'RESET_AND_START_SCAN',
                payload: 'https://example.com',
            });
        });

        it('should send SCAN_REQUEST to re-run axe', async () => {
            const { result } = renderHook(() => useScanWithAnimation());

            await act(async () => {
                await result.current.handleRefresh();
            });

            expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: MessageType.SCAN_REQUEST,
                    data: expect.objectContaining({
                        url: 'https://example.com',
                        runId: expect.any(String),
                    }),
                })
            );
        });

        it('should set isAnimating to true when refresh starts', async () => {
            const { result } = renderHook(() => useScanWithAnimation());

            expect(result.current.isAnimating).toBe(false);

            await act(async () => {
                result.current.handleRefresh();
            });

            expect(result.current.isAnimating).toBe(true);
        });

        it('should dispatch SCAN_ERROR when no active tab', async () => {
            mockChrome.tabs.query.mockResolvedValueOnce([]);

            const { result } = renderHook(() => useScanWithAnimation());

            await act(async () => {
                await result.current.handleRefresh();
            });

            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'SCAN_ERROR',
                    payload: expect.any(String),
                })
            );
        });
    });

    describe('handleAnimationComplete', () => {
        it('should set isAnimating to false', async () => {
            const { result } = renderHook(() => useScanWithAnimation());

            await act(async () => {
                await result.current.handleScan();
            });
            expect(result.current.isAnimating).toBe(true);

            act(() => {
                result.current.handleAnimationComplete();
            });

            expect(result.current.isAnimating).toBe(false);
        });

        it('should dispatch SCAN_COMPLETE with buffered result when message received before animation complete', async () => {
            const scanResult = createMockScanResult({
                url: 'https://example.com',
            });
            const { result } = renderHook(() => useScanWithAnimation());

            await act(async () => {
                await result.current.handleScan();
            });

            const sendCall = mockChrome.runtime.sendMessage.mock.calls[0];
            const runId = sendCall[0].data.runId;

            await act(async () => {
                triggerRuntimeMessage({
                    type: MessageType.SCAN_COMPLETE,
                    data: { result: scanResult, runId },
                });
            });

            act(() => {
                result.current.handleAnimationComplete();
            });

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SCAN_COMPLETE',
                payload: scanResult,
            });
        });
    });
});
