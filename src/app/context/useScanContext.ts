import { useContext } from 'react';
import type { Issue } from '@/types/issue';
import type { ManualChecklist } from '@/types/checklist';
import { ScanStateContext, ScanDispatchContext } from './stateContexts';
import type { ViewMode } from './scanTypes';
import { filterIssues } from '@/services/issueFilters';

export type { Filters, ViewMode } from './scanTypes';

export function useScanState() {
    const context = useContext(ScanStateContext);
    if (context === undefined) {
        throw new Error('useScanState must be used within a ScanProvider');
    }
    return context;
}

export function useScanDispatch() {
    const context = useContext(ScanDispatchContext);
    if (context === undefined) {
        throw new Error('useScanDispatch must be used within a ScanProvider');
    }
    return context;
}

export function useFilteredIssues(): Issue[] {
    const { currentScan, filters } = useScanState();
    return currentScan ? filterIssues(currentScan.issues, filters) : [];
}

export function useIncompleteChecks(): Issue[] {
    const { currentScan } = useScanState();
    return currentScan?.incompleteChecks || [];
}

export function useChecklist(): ManualChecklist | null {
    const { currentChecklist } = useScanState();
    return currentChecklist;
}

export function useViewMode(): ViewMode {
    const { viewMode } = useScanState();
    return viewMode;
}
