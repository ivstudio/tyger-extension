import { describe, it, expect } from 'vitest';
import { scanReducer } from './scanReducer';
import { initialState } from './scanTypes';
import { createMockScanResult, createMockIssue } from '@/test/fixtures';
import {
    createMockManualChecklist,
    createMockChecklistCategory,
} from '@/test/fixtures/checklists';
import type { ScanState } from './scanTypes';

describe('scanReducer', () => {
    describe('SCAN_START', () => {
        it('should set isScanning to true and clear error', () => {
            const prevState: ScanState = {
                ...initialState,
                isScanning: false,
                error: 'Previous error',
            };

            const nextState = scanReducer(prevState, { type: 'SCAN_START' });

            expect(nextState.isScanning).toBe(true);
            expect(nextState.error).toBeNull();
        });

        it('should set currentUrl when payload is provided', () => {
            const url = 'https://example.com/page';
            const nextState = scanReducer(initialState, {
                type: 'SCAN_START',
                payload: url,
            });

            expect(nextState.currentUrl).toBe(url);
            expect(nextState.isScanning).toBe(true);
        });

        it('should preserve currentUrl when payload is not provided', () => {
            const prevState: ScanState = {
                ...initialState,
                currentUrl: 'https://example.com',
            };

            const nextState = scanReducer(prevState, { type: 'SCAN_START' });

            expect(nextState.currentUrl).toBe('https://example.com');
        });

        it('should preserve other state properties', () => {
            const currentScan = createMockScanResult();
            const prevState: ScanState = {
                ...initialState,
                currentScan,
            };

            const nextState = scanReducer(prevState, { type: 'SCAN_START' });

            expect(nextState.currentScan).toBe(currentScan);
        });
    });

    describe('SCAN_COMPLETE', () => {
        it('should set current scan and move current to previous', () => {
            const scan1 = createMockScanResult({ timestamp: 1000 });
            const scan2 = createMockScanResult({ timestamp: 2000 });

            const stateWithScan1: ScanState = {
                ...initialState,
                currentScan: scan1,
                isScanning: true,
            };

            const nextState = scanReducer(stateWithScan1, {
                type: 'SCAN_COMPLETE',
                payload: scan2,
            });

            expect(nextState.currentScan).toEqual(scan2);
            expect(nextState.previousScan).toEqual(scan1);
            expect(nextState.isScanning).toBe(false);
            expect(nextState.error).toBeNull();
        });

        it('should set previousScan to null when no previous scan exists', () => {
            const scan = createMockScanResult();

            const nextState = scanReducer(initialState, {
                type: 'SCAN_COMPLETE',
                payload: scan,
            });

            expect(nextState.currentScan).toEqual(scan);
            expect(nextState.previousScan).toBeNull();
        });
    });

    describe('SCAN_ERROR', () => {
        it('should set error and stop scanning', () => {
            const prevState: ScanState = {
                ...initialState,
                isScanning: true,
            };

            const nextState = scanReducer(prevState, {
                type: 'SCAN_ERROR',
                payload: 'Scan failed: Network error',
            });

            expect(nextState.isScanning).toBe(false);
            expect(nextState.error).toBe('Scan failed: Network error');
        });
    });

    describe('SELECT_ISSUE', () => {
        it('should set selected issue', () => {
            const issue = createMockIssue();

            const nextState = scanReducer(initialState, {
                type: 'SELECT_ISSUE',
                payload: issue,
            });

            expect(nextState.selectedIssue).toEqual(issue);
        });

        it('should allow deselecting issue with null', () => {
            const issue = createMockIssue();
            const stateWithSelection: ScanState = {
                ...initialState,
                selectedIssue: issue,
            };

            const nextState = scanReducer(stateWithSelection, {
                type: 'SELECT_ISSUE',
                payload: null,
            });

            expect(nextState.selectedIssue).toBeNull();
        });
    });

    describe('UPDATE_FILTERS', () => {
        it('should update filter properties', () => {
            const nextState = scanReducer(initialState, {
                type: 'UPDATE_FILTERS',
                payload: {
                    severity: ['critical', 'serious'],
                    search: 'color',
                },
            });

            expect(nextState.filters.severity).toEqual(['critical', 'serious']);
            expect(nextState.filters.search).toBe('color');
            expect(nextState.filters.wcag).toEqual([]); // Unchanged
            expect(nextState.filters.status).toEqual([]); // Unchanged
        });

        it('should merge filter updates', () => {
            const stateWithFilters: ScanState = {
                ...initialState,
                filters: {
                    severity: ['critical'],
                    wcag: ['AA'],
                    status: [],
                    search: '',
                },
            };

            const nextState = scanReducer(stateWithFilters, {
                type: 'UPDATE_FILTERS',
                payload: {
                    search: 'button',
                },
            });

            expect(nextState.filters).toEqual({
                severity: ['critical'],
                wcag: ['AA'],
                status: [],
                search: 'button',
            });
        });
    });

    describe('CLEAR_FILTERS', () => {
        it('should reset filters to initial state', () => {
            const stateWithFilters: ScanState = {
                ...initialState,
                filters: {
                    severity: ['critical', 'serious'],
                    wcag: ['AA', 'AAA'],
                    status: ['open'],
                    search: 'test search',
                },
            };

            const nextState = scanReducer(stateWithFilters, {
                type: 'CLEAR_FILTERS',
            });

            expect(nextState.filters).toEqual(initialState.filters);
        });
    });

    describe('RESET', () => {
        it('should reset entire state to initial state', () => {
            const complexState: ScanState = {
                currentScan: createMockScanResult(),
                previousScan: createMockScanResult(),
                selectedIssue: createMockIssue(),
                filters: {
                    severity: ['critical'],
                    wcag: ['AA'],
                    status: ['open'],
                    search: 'test',
                },
                isScanning: true,
                error: 'Some error',
                hasScannedOnce: true,
                currentChecklist: createMockManualChecklist(),
                viewMode: 'checklist',
                currentUrl: 'https://example.com',
            };

            const nextState = scanReducer(complexState, { type: 'RESET' });

            expect(nextState).toEqual(initialState);
        });
    });

    describe('RESET_AND_START_SCAN', () => {
        const url = 'https://example.com/refresh';

        it('should clear scan-related state and set scanning', () => {
            const stateWithScan: ScanState = {
                ...initialState,
                currentScan: createMockScanResult(),
                previousScan: createMockScanResult(),
                selectedIssue: createMockIssue(),
                filters: {
                    severity: ['critical'],
                    wcag: ['AA'],
                    status: ['open'],
                    search: 'test',
                },
                error: 'Some error',
                hasScannedOnce: true,
                currentUrl: 'https://old.com',
            };

            const nextState = scanReducer(stateWithScan, {
                type: 'RESET_AND_START_SCAN',
                payload: url,
            });

            expect(nextState.currentScan).toBeNull();
            expect(nextState.previousScan).toBeNull();
            expect(nextState.selectedIssue).toBeNull();
            expect(nextState.error).toBeNull();
            expect(nextState.filters).toEqual(initialState.filters);
            expect(nextState.isScanning).toBe(true);
            expect(nextState.hasScannedOnce).toBe(true);
            expect(nextState.currentUrl).toBe(url);
        });

        it('should not set hasScannedOnce to false', () => {
            const nextState = scanReducer(initialState, {
                type: 'RESET_AND_START_SCAN',
                payload: url,
            });

            expect(nextState.hasScannedOnce).toBe(true);
        });

        it('should preserve currentChecklist and viewMode', () => {
            const stateWithChecklist: ScanState = {
                ...initialState,
                currentScan: createMockScanResult(),
                currentChecklist: createMockManualChecklist(),
                viewMode: 'checklist',
                hasScannedOnce: true,
            };

            const nextState = scanReducer(stateWithChecklist, {
                type: 'RESET_AND_START_SCAN',
                payload: url,
            });

            expect(nextState.currentChecklist).toEqual(
                stateWithChecklist.currentChecklist
            );
            expect(nextState.viewMode).toBe('checklist');
        });
    });

    describe('UPDATE_ISSUE_STATUS', () => {
        it('should update issue status in current scan', () => {
            const issue1 = createMockIssue({ id: 'issue-1', status: 'open' });
            const issue2 = createMockIssue({ id: 'issue-2', status: 'open' });
            const scan = createMockScanResult({ issues: [issue1, issue2] });

            const stateWithScan: ScanState = {
                ...initialState,
                currentScan: scan,
            };

            const nextState = scanReducer(stateWithScan, {
                type: 'UPDATE_ISSUE_STATUS',
                payload: {
                    issueId: 'issue-1',
                    status: 'fixed',
                    notes: 'Fixed in PR #123',
                },
            });

            expect(nextState.currentScan?.issues[0].status).toBe('fixed');
            expect(nextState.currentScan?.issues[0].notes).toBe(
                'Fixed in PR #123'
            );
            expect(nextState.currentScan?.issues[1].status).toBe('open'); // Unchanged
        });

        it('should update selected issue if it matches', () => {
            const issue = createMockIssue({ id: 'issue-1', status: 'open' });
            const scan = createMockScanResult({ issues: [issue] });

            const stateWithSelection: ScanState = {
                ...initialState,
                currentScan: scan,
                selectedIssue: issue,
            };

            const nextState = scanReducer(stateWithSelection, {
                type: 'UPDATE_ISSUE_STATUS',
                payload: {
                    issueId: 'issue-1',
                    status: 'ignored',
                },
            });

            expect(nextState.selectedIssue?.status).toBe('ignored');
        });

        it('should not update selected issue if ID does not match', () => {
            const issue1 = createMockIssue({ id: 'issue-1', status: 'open' });
            const issue2 = createMockIssue({ id: 'issue-2', status: 'open' });
            const scan = createMockScanResult({ issues: [issue1, issue2] });

            const stateWithSelection: ScanState = {
                ...initialState,
                currentScan: scan,
                selectedIssue: issue2,
            };

            const nextState = scanReducer(stateWithSelection, {
                type: 'UPDATE_ISSUE_STATUS',
                payload: {
                    issueId: 'issue-1',
                    status: 'fixed',
                },
            });

            expect(nextState.selectedIssue?.status).toBe('open'); // Unchanged
        });

        it('should return state unchanged if no current scan', () => {
            const nextState = scanReducer(initialState, {
                type: 'UPDATE_ISSUE_STATUS',
                payload: {
                    issueId: 'issue-1',
                    status: 'fixed',
                },
            });

            expect(nextState).toEqual(initialState);
        });

        it('should preserve issue immutability', () => {
            const issue = createMockIssue({ id: 'issue-1', status: 'open' });
            const scan = createMockScanResult({ issues: [issue] });

            const stateWithScan: ScanState = {
                ...initialState,
                currentScan: scan,
            };

            const nextState = scanReducer(stateWithScan, {
                type: 'UPDATE_ISSUE_STATUS',
                payload: {
                    issueId: 'issue-1',
                    status: 'fixed',
                },
            });

            // Original issue should be unchanged
            expect(issue.status).toBe('open');
            // New state should have updated issue
            expect(nextState.currentScan?.issues[0].status).toBe('fixed');
            // Objects should be different references
            expect(nextState.currentScan?.issues[0]).not.toBe(issue);
        });
    });

    describe('SET_VIEW_MODE', () => {
        it('should set view mode to issues', () => {
            const nextState = scanReducer(initialState, {
                type: 'SET_VIEW_MODE',
                payload: 'issues',
            });

            expect(nextState.viewMode).toBe('issues');
        });

        it('should set view mode to checklist', () => {
            const nextState = scanReducer(initialState, {
                type: 'SET_VIEW_MODE',
                payload: 'checklist',
            });

            expect(nextState.viewMode).toBe('checklist');
        });

        it('should clear selected issue when switching views', () => {
            const issue = createMockIssue();
            const stateWithSelectedIssue = {
                ...initialState,
                selectedIssue: issue,
            };

            const nextState = scanReducer(stateWithSelectedIssue, {
                type: 'SET_VIEW_MODE',
                payload: 'checklist',
            });

            expect(nextState.selectedIssue).toBeNull();
            expect(nextState.viewMode).toBe('checklist');
        });
    });

    describe('LOAD_CHECKLIST', () => {
        it('should load checklist', () => {
            const checklist = createMockManualChecklist();

            const nextState = scanReducer(initialState, {
                type: 'LOAD_CHECKLIST',
                payload: checklist,
            });

            expect(nextState.currentChecklist).toEqual(checklist);
        });
    });

    describe('UPDATE_CHECKLIST_ITEM', () => {
        it('should update checklist item status', () => {
            const checklist = createMockManualChecklist({
                categories: [
                    createMockChecklistCategory({
                        id: 'category-1',
                        items: [
                            {
                                id: 'item-1',
                                title: 'Item 1',
                                description: '',
                                status: 'pending',
                            },
                            {
                                id: 'item-2',
                                title: 'Item 2',
                                description: '',
                                status: 'pending',
                            },
                        ],
                    }),
                ],
            });

            const stateWithChecklist: ScanState = {
                ...initialState,
                currentChecklist: checklist,
            };

            const nextState = scanReducer(stateWithChecklist, {
                type: 'UPDATE_CHECKLIST_ITEM',
                payload: {
                    categoryId: 'category-1',
                    itemId: 'item-1',
                    status: 'pass',
                    notes: 'Verified with keyboard',
                },
            });

            const item = nextState.currentChecklist?.categories[0].items[0];
            expect(item?.status).toBe('pass');
            expect(item?.notes).toBe('Verified with keyboard');
        });

        it('should update timestamp when item is updated', () => {
            const checklist = createMockManualChecklist({
                timestamp: 1000,
                categories: [
                    createMockChecklistCategory({
                        id: 'category-1',
                        items: [
                            {
                                id: 'item-1',
                                title: 'Item 1',
                                description: '',
                                status: 'pending',
                            },
                        ],
                    }),
                ],
            });

            const stateWithChecklist: ScanState = {
                ...initialState,
                currentChecklist: checklist,
            };

            const nextState = scanReducer(stateWithChecklist, {
                type: 'UPDATE_CHECKLIST_ITEM',
                payload: {
                    categoryId: 'category-1',
                    itemId: 'item-1',
                    status: 'pass',
                },
            });

            expect(nextState.currentChecklist?.timestamp).toBeGreaterThan(1000);
        });

        it('should mark checklist as completed when all items are non-pending', () => {
            const checklist = createMockManualChecklist({
                completed: false,
                categories: [
                    createMockChecklistCategory({
                        id: 'category-1',
                        items: [
                            {
                                id: 'item-1',
                                title: 'Item 1',
                                description: '',
                                status: 'pass',
                            },
                            {
                                id: 'item-2',
                                title: 'Item 2',
                                description: '',
                                status: 'pending',
                            },
                        ],
                    }),
                ],
            });

            const stateWithChecklist: ScanState = {
                ...initialState,
                currentChecklist: checklist,
            };

            const nextState = scanReducer(stateWithChecklist, {
                type: 'UPDATE_CHECKLIST_ITEM',
                payload: {
                    categoryId: 'category-1',
                    itemId: 'item-2',
                    status: 'fail',
                },
            });

            expect(nextState.currentChecklist?.completed).toBe(true);
        });

        it('should not mark as completed if any item is pending', () => {
            const checklist = createMockManualChecklist({
                categories: [
                    createMockChecklistCategory({
                        id: 'category-1',
                        items: [
                            {
                                id: 'item-1',
                                title: 'Item 1',
                                description: '',
                                status: 'pass',
                            },
                            {
                                id: 'item-2',
                                title: 'Item 2',
                                description: '',
                                status: 'pending',
                            },
                            {
                                id: 'item-3',
                                title: 'Item 3',
                                description: '',
                                status: 'pending',
                            },
                        ],
                    }),
                ],
            });

            const stateWithChecklist: ScanState = {
                ...initialState,
                currentChecklist: checklist,
            };

            const nextState = scanReducer(stateWithChecklist, {
                type: 'UPDATE_CHECKLIST_ITEM',
                payload: {
                    categoryId: 'category-1',
                    itemId: 'item-2',
                    status: 'pass',
                },
            });

            expect(nextState.currentChecklist?.completed).toBe(false);
        });

        it('should return state unchanged if no current checklist', () => {
            const nextState = scanReducer(initialState, {
                type: 'UPDATE_CHECKLIST_ITEM',
                payload: {
                    categoryId: 'category-1',
                    itemId: 'item-1',
                    status: 'pass',
                },
            });

            expect(nextState).toEqual(initialState);
        });

        it('should handle multiple categories', () => {
            const checklist = createMockManualChecklist({
                categories: [
                    createMockChecklistCategory({
                        id: 'category-1',
                        items: [
                            {
                                id: 'item-1',
                                title: 'Item 1',
                                description: '',
                                status: 'pending',
                            },
                        ],
                    }),
                    createMockChecklistCategory({
                        id: 'category-2',
                        items: [
                            {
                                id: 'item-2',
                                title: 'Item 2',
                                description: '',
                                status: 'pending',
                            },
                        ],
                    }),
                ],
            });

            const stateWithChecklist: ScanState = {
                ...initialState,
                currentChecklist: checklist,
            };

            const nextState = scanReducer(stateWithChecklist, {
                type: 'UPDATE_CHECKLIST_ITEM',
                payload: {
                    categoryId: 'category-2',
                    itemId: 'item-2',
                    status: 'skip',
                },
            });

            // Category 1 should be unchanged
            expect(
                nextState.currentChecklist?.categories[0].items[0].status
            ).toBe('pending');
            // Category 2 should be updated
            expect(
                nextState.currentChecklist?.categories[1].items[0].status
            ).toBe('skip');
        });
    });

    describe('RESET_CHECKLIST', () => {
        it('should clear current checklist', () => {
            const checklist = createMockManualChecklist();

            const stateWithChecklist: ScanState = {
                ...initialState,
                currentChecklist: checklist,
            };

            const nextState = scanReducer(stateWithChecklist, {
                type: 'RESET_CHECKLIST',
            });

            expect(nextState.currentChecklist).toBeNull();
        });
    });

    describe('SET_CURRENT_URL', () => {
        it('should set current URL', () => {
            const url = 'https://example.com/page';

            const nextState = scanReducer(initialState, {
                type: 'SET_CURRENT_URL',
                payload: url,
            });

            expect(nextState.currentUrl).toBe(url);
        });

        it('should update current URL', () => {
            const prevState: ScanState = {
                ...initialState,
                currentUrl: 'https://old-url.com',
            };

            const nextState = scanReducer(prevState, {
                type: 'SET_CURRENT_URL',
                payload: 'https://new-url.com',
            });

            expect(nextState.currentUrl).toBe('https://new-url.com');
        });
    });

    describe('default case', () => {
        it('should return state unchanged for unknown action', () => {
            const prevState: ScanState = {
                ...initialState,
                isScanning: true,
            };

            const nextState = scanReducer(prevState, {
                type: 'UNKNOWN_ACTION',
            } as any);

            expect(nextState).toBe(prevState);
        });
    });

    describe('immutability', () => {
        it('should never mutate the original state', () => {
            const issue = createMockIssue({ id: 'issue-1', status: 'open' });
            const scan = createMockScanResult({ issues: [issue] });

            const originalState: ScanState = {
                ...initialState,
                currentScan: scan,
            };

            const originalScanRef = originalState.currentScan;
            const originalIssuesRef = originalState.currentScan?.issues;

            scanReducer(originalState, {
                type: 'UPDATE_ISSUE_STATUS',
                payload: { issueId: 'issue-1', status: 'fixed' },
            });

            // Original state should be completely unchanged
            expect(originalState.currentScan).toBe(originalScanRef);
            expect(originalState.currentScan?.issues).toBe(originalIssuesRef);
            expect(originalState.currentScan?.issues[0].status).toBe('open');
        });
    });
});
