import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { ScanActionsProvider, useScanActions } from './ScanActionsContext';

describe('ScanActionsContext', () => {
    const mockHandleScan = async () => {};
    const mockHandleRefresh = async () => {};

    const value = {
        handleScan: mockHandleScan,
        handleRefresh: mockHandleRefresh,
    };

    it('returns handleScan and handleRefresh when used inside provider', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <ScanActionsProvider value={value}>{children}</ScanActionsProvider>
        );

        const { result } = renderHook(() => useScanActions(), { wrapper });

        expect(result.current.handleScan).toBe(mockHandleScan);
        expect(result.current.handleRefresh).toBe(mockHandleRefresh);
    });

    it('throws when used outside ScanActionsProvider', () => {
        expect(() => renderHook(() => useScanActions())).toThrow(
            'useScanActions must be used within a ScanActionsProvider'
        );
    });
});
