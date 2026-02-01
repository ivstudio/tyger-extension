import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Issue } from '@/types/issue';
import { scanReducer } from './scanReducer';
import {
    initialState,
    type ScanState,
    type ScanAction,
    type Filters,
} from './scanTypes';
import { filterIssues } from '@/services/issueFilters';

export type { Filters };

const ScanStateContext = createContext<ScanState | undefined>(undefined);
const ScanDispatchContext = createContext<
    React.Dispatch<ScanAction> | undefined
>(undefined);

export function ScanProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(scanReducer, initialState);

    return (
        <ScanStateContext.Provider value={state}>
            <ScanDispatchContext.Provider value={dispatch}>
                {children}
            </ScanDispatchContext.Provider>
        </ScanStateContext.Provider>
    );
}

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
