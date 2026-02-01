import {
    ScanResult,
    Issue,
    ImpactLevel,
    WCAGLevel,
    IssueStatus,
} from '@/types/issue';

export interface Filters {
    severity: ImpactLevel[];
    wcag: WCAGLevel[];
    status: IssueStatus[];
    search: string;
}

export interface ScanState {
    currentScan: ScanResult | null;
    previousScan: ScanResult | null;
    selectedIssue: Issue | null;
    filters: Filters;
    isScanning: boolean;
    error: string | null;
}

export type ScanAction =
    | { type: 'SCAN_START' }
    | { type: 'SCAN_COMPLETE'; payload: ScanResult }
    | { type: 'SCAN_ERROR'; payload: string }
    | { type: 'SELECT_ISSUE'; payload: Issue | null }
    | { type: 'UPDATE_FILTERS'; payload: Partial<Filters> }
    | { type: 'CLEAR_FILTERS' }
    | {
          type: 'UPDATE_ISSUE_STATUS';
          payload: { issueId: string; status: IssueStatus; notes?: string };
      };

export const initialState: ScanState = {
    currentScan: null,
    previousScan: null,
    selectedIssue: null,
    filters: {
        severity: [],
        wcag: [],
        status: [],
        search: '',
    },
    isScanning: false,
    error: null,
};
