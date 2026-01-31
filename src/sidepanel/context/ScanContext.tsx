import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ScanResult, Issue, ImpactLevel, WCAGLevel, IssueStatus } from '@/types/issue';

export interface Filters {
  severity: ImpactLevel[];
  wcag: WCAGLevel[];
  status: IssueStatus[];
  search: string;
}

interface ScanState {
  currentScan: ScanResult | null;
  previousScan: ScanResult | null;
  selectedIssue: Issue | null;
  filters: Filters;
  isScanning: boolean;
  error: string | null;
}

type ScanAction =
  | { type: 'SCAN_START' }
  | { type: 'SCAN_COMPLETE'; payload: ScanResult }
  | { type: 'SCAN_ERROR'; payload: string }
  | { type: 'SELECT_ISSUE'; payload: Issue | null }
  | { type: 'UPDATE_FILTERS'; payload: Partial<Filters> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'UPDATE_ISSUE_STATUS'; payload: { issueId: string; status: IssueStatus; notes?: string } };

const initialState: ScanState = {
  currentScan: null,
  previousScan: null,
  selectedIssue: null,
  filters: {
    severity: [],
    wcag: [],
    status: [],
    search: ''
  },
  isScanning: false,
  error: null
};

function scanReducer(state: ScanState, action: ScanAction): ScanState {
  switch (action.type) {
    case 'SCAN_START':
      return {
        ...state,
        isScanning: true,
        error: null
      };

    case 'SCAN_COMPLETE':
      return {
        ...state,
        currentScan: action.payload,
        previousScan: state.currentScan,
        isScanning: false,
        error: null
      };

    case 'SCAN_ERROR':
      return {
        ...state,
        isScanning: false,
        error: action.payload
      };

    case 'SELECT_ISSUE':
      return {
        ...state,
        selectedIssue: action.payload
      };

    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: initialState.filters
      };

    case 'UPDATE_ISSUE_STATUS':
      if (!state.currentScan) return state;

      const updatedIssues = state.currentScan.issues.map(issue =>
        issue.id === action.payload.issueId
          ? { ...issue, status: action.payload.status, notes: action.payload.notes }
          : issue
      );

      return {
        ...state,
        currentScan: {
          ...state.currentScan,
          issues: updatedIssues
        },
        selectedIssue: state.selectedIssue?.id === action.payload.issueId
          ? { ...state.selectedIssue, status: action.payload.status, notes: action.payload.notes }
          : state.selectedIssue
      };

    default:
      return state;
  }
}

const ScanStateContext = createContext<ScanState | undefined>(undefined);
const ScanDispatchContext = createContext<React.Dispatch<ScanAction> | undefined>(undefined);

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

// Helper hook to get filtered issues
export function useFilteredIssues(): Issue[] {
  const { currentScan, filters } = useScanState();

  if (!currentScan) return [];

  return currentScan.issues.filter(issue => {
    // Filter by severity
    if (filters.severity.length > 0 && !filters.severity.includes(issue.impact)) {
      return false;
    }

    // Filter by WCAG level
    if (filters.wcag.length > 0 && !filters.wcag.includes(issue.wcag.level)) {
      return false;
    }

    // Filter by status
    if (filters.status.length > 0 && !filters.status.includes(issue.status)) {
      return false;
    }

    // Filter by search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        issue.title.toLowerCase().includes(search) ||
        issue.description.toLowerCase().includes(search) ||
        issue.ruleId.toLowerCase().includes(search)
      );
    }

    return true;
  });
}
