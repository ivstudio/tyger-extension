import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { ScanProvider } from './ScanContext';
import {
    useScanState,
    useScanDispatch,
    useFilteredIssues,
    useIncompleteChecks,
    useChecklist,
    useViewMode,
} from './useScanContext';
import { createMockScanResult } from '@/test/fixtures/scanResults';
import { createMockManualChecklist } from '@/test/fixtures/checklists';

function wrapper({ children }: { children: ReactNode }) {
    return <ScanProvider>{children}</ScanProvider>;
}

describe('useScanContext hooks', () => {
    describe('useScanState', () => {
        it('returns state when inside ScanProvider', () => {
            const { result } = renderHook(() => useScanState(), { wrapper });

            expect(result.current).toBeDefined();
            expect(result.current.currentScan).toBeNull();
            expect(result.current.filters).toEqual({
                severity: [],
                wcag: [],
                status: [],
                search: '',
            });
            expect(result.current.viewMode).toBe('issues');
        });

        it('throws when used outside ScanProvider', () => {
            expect(() => renderHook(() => useScanState())).toThrow(
                'useScanState must be used within a ScanProvider'
            );
        });
    });

    describe('useScanDispatch', () => {
        it('returns dispatch function when inside ScanProvider', () => {
            const { result } = renderHook(() => useScanDispatch(), { wrapper });

            expect(typeof result.current).toBe('function');
        });

        it('throws when used outside ScanProvider', () => {
            expect(() => renderHook(() => useScanDispatch())).toThrow(
                'useScanDispatch must be used within a ScanProvider'
            );
        });
    });

    describe('useFilteredIssues', () => {
        it('returns empty array when no currentScan', () => {
            const { result } = renderHook(() => useFilteredIssues(), {
                wrapper,
            });

            expect(result.current).toEqual([]);
        });

        it('returns filtered issues when currentScan exists', async () => {
            const scan = createMockScanResult({
                issues: [
                    {
                        id: '1',
                        ruleId: 'a',
                        title: 'Issue A',
                        description: 'Desc A',
                        impact: 'serious',
                        wcag: { level: 'AA', criteria: [] },
                        status: 'open',
                    } as any,
                    {
                        id: '2',
                        ruleId: 'b',
                        title: 'Issue B',
                        description: 'Desc B',
                        impact: 'critical',
                        wcag: { level: 'A', criteria: [] },
                        status: 'open',
                    } as any,
                ],
            });
            function ScanSeeder({
                payload,
                children,
            }: {
                payload: typeof scan;
                children: ReactNode;
            }) {
                const dispatch = useScanDispatch();
                React.useEffect(() => {
                    dispatch({ type: 'SCAN_COMPLETE', payload });
                }, [dispatch, payload]);
                return <>{children}</>;
            }
            const wrapperWithScan = ({ children }: { children: ReactNode }) => (
                <ScanProvider>
                    <ScanSeeder payload={scan}>{children}</ScanSeeder>
                </ScanProvider>
            );

            const { result } = renderHook(() => useFilteredIssues(), {
                wrapper: wrapperWithScan,
            });

            await act(async () => {
                await Promise.resolve();
            });

            expect(result.current).toHaveLength(2);
        });
    });

    describe('useIncompleteChecks', () => {
        it('returns empty array when no scan exists', () => {
            const { result } = renderHook(() => useIncompleteChecks(), {
                wrapper,
            });

            expect(result.current).toEqual([]);
        });

        it('returns array when inside provider', () => {
            const { result } = renderHook(() => useIncompleteChecks(), {
                wrapper,
            });

            expect(result.current).toBeDefined();
            expect(Array.isArray(result.current)).toBe(true);
        });

        it('returns incompleteChecks when currentScan has them', async () => {
            const incomplete = [
                {
                    id: 'inc-1',
                    ruleId: 'image-alt',
                    title: 'Image alt',
                    description: 'Check alt',
                    impact: 'critical',
                    wcag: { level: 'A', criteria: [] },
                    status: 'open',
                } as any,
            ];
            const scan = createMockScanResult({
                issues: [],
                incompleteChecks: incomplete,
            });
            function ScanSeeder({
                payload,
                children,
            }: {
                payload: typeof scan;
                children: ReactNode;
            }) {
                const dispatch = useScanDispatch();
                React.useEffect(() => {
                    dispatch({ type: 'SCAN_COMPLETE', payload });
                }, [dispatch, payload]);
                return <>{children}</>;
            }
            const wrapperWithScan = ({ children }: { children: ReactNode }) => (
                <ScanProvider>
                    <ScanSeeder payload={scan}>{children}</ScanSeeder>
                </ScanProvider>
            );

            const { result } = renderHook(() => useIncompleteChecks(), {
                wrapper: wrapperWithScan,
            });

            await act(async () => {
                await Promise.resolve();
            });

            expect(result.current).toHaveLength(1);
            expect(result.current[0].id).toBe('inc-1');
        });
    });

    describe('useChecklist', () => {
        it('returns null when no checklist loaded', () => {
            const { result } = renderHook(() => useChecklist(), { wrapper });

            expect(result.current).toBeNull();
        });

        it('returns checklist when loaded', async () => {
            const checklist = createMockManualChecklist({
                url: 'https://example.com',
            });
            function ChecklistSeeder({
                payload,
                children,
            }: {
                payload: typeof checklist;
                children: ReactNode;
            }) {
                const dispatch = useScanDispatch();
                React.useEffect(() => {
                    dispatch({ type: 'LOAD_CHECKLIST', payload });
                }, [dispatch, payload]);
                return <>{children}</>;
            }
            const wrapperWithChecklist = ({
                children,
            }: {
                children: ReactNode;
            }) => (
                <ScanProvider>
                    <ChecklistSeeder payload={checklist}>
                        {children}
                    </ChecklistSeeder>
                </ScanProvider>
            );

            const { result } = renderHook(() => useChecklist(), {
                wrapper: wrapperWithChecklist,
            });

            await act(async () => {
                await Promise.resolve();
            });

            expect(result.current).not.toBeNull();
            expect(result.current?.url).toBe('https://example.com');
        });
    });

    describe('useViewMode', () => {
        it('returns default viewMode issues', () => {
            const { result } = renderHook(() => useViewMode(), { wrapper });

            expect(result.current).toBe('issues');
        });

        it('returns checklist when viewMode is set', async () => {
            function ViewModeSeeder({ children }: { children: ReactNode }) {
                const dispatch = useScanDispatch();
                React.useEffect(() => {
                    dispatch({
                        type: 'SET_VIEW_MODE',
                        payload: 'checklist',
                    });
                }, [dispatch]);
                return <>{children}</>;
            }
            const wrapperWithViewMode = ({
                children,
            }: {
                children: ReactNode;
            }) => (
                <ScanProvider>
                    <ViewModeSeeder>{children}</ViewModeSeeder>
                </ScanProvider>
            );

            const { result } = renderHook(() => useViewMode(), {
                wrapper: wrapperWithViewMode,
            });

            await act(async () => {
                await Promise.resolve();
            });

            expect(result.current).toBe('checklist');
        });
    });
});
