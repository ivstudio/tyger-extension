import {
    ScanResult,
    Issue,
    ImpactLevel,
    WCAGLevel,
    IssueStatus,
} from '@/types/issue';
import {
    ManualChecklist,
    ChecklistItemStatus,
} from '@/types/checklist';

export type ViewMode = 'issues' | 'checklist';

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
    currentChecklist: ManualChecklist | null;
    viewMode: ViewMode;
}

export type ScanAction =
    | { type: 'SCAN_START' }
    | { type: 'SCAN_COMPLETE'; payload: ScanResult }
    | { type: 'SCAN_ERROR'; payload: string }
    | { type: 'SELECT_ISSUE'; payload: Issue | null }
    | { type: 'UPDATE_FILTERS'; payload: Partial<Filters> }
    | { type: 'CLEAR_FILTERS' }
    | { type: 'RESET' }
    | {
          type: 'UPDATE_ISSUE_STATUS';
          payload: { issueId: string; status: IssueStatus; notes?: string };
      }
    | { type: 'SET_VIEW_MODE'; payload: ViewMode }
    | { type: 'LOAD_CHECKLIST'; payload: ManualChecklist }
    | {
          type: 'UPDATE_CHECKLIST_ITEM';
          payload: {
              categoryId: string;
              itemId: string;
              status: ChecklistItemStatus;
              notes?: string;
          };
      }
    | { type: 'RESET_CHECKLIST' };

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
    currentChecklist: null,
    viewMode: 'issues',
};
