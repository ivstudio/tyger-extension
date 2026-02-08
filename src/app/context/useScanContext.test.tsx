import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { ScanProvider } from './ScanContext';
import { useIncompleteChecks } from './useScanContext';

// Wrapper component for hooks that need ScanProvider
function wrapper({ children }: { children: ReactNode }) {
    return <ScanProvider>{children}</ScanProvider>;
}

describe('useScanContext hooks', () => {
    describe('useIncompleteChecks', () => {
        it('should return empty array when no scan exists', () => {
            const { result } = renderHook(() => useIncompleteChecks(), {
                wrapper,
            });

            expect(result.current).toEqual([]);
        });

        it('should be defined and return an array', () => {
            const { result } = renderHook(() => useIncompleteChecks(), {
                wrapper,
            });

            expect(result.current).toBeDefined();
            expect(Array.isArray(result.current)).toBe(true);
        });
    });
});
