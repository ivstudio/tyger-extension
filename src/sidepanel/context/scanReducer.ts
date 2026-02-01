import { ScanState, ScanAction, initialState } from './scanTypes';

export function scanReducer(state: ScanState, action: ScanAction): ScanState {
    switch (action.type) {
        case 'SCAN_START':
            return {
                ...state,
                isScanning: true,
                error: null,
            };

        case 'SCAN_COMPLETE':
            return {
                ...state,
                currentScan: action.payload,
                previousScan: state.currentScan,
                isScanning: false,
                error: null,
            };

        case 'SCAN_ERROR':
            return {
                ...state,
                isScanning: false,
                error: action.payload,
            };

        case 'SELECT_ISSUE':
            return {
                ...state,
                selectedIssue: action.payload,
            };

        case 'UPDATE_FILTERS':
            return {
                ...state,
                filters: {
                    ...state.filters,
                    ...action.payload,
                },
            };

        case 'CLEAR_FILTERS':
            return {
                ...state,
                filters: initialState.filters,
            };

        case 'RESET':
            return initialState;

        case 'UPDATE_ISSUE_STATUS':
            if (!state.currentScan) return state;

            const updatedIssues = state.currentScan.issues.map(issue =>
                issue.id === action.payload.issueId
                    ? {
                          ...issue,
                          status: action.payload.status,
                          notes: action.payload.notes,
                      }
                    : issue
            );

            return {
                ...state,
                currentScan: {
                    ...state.currentScan,
                    issues: updatedIssues,
                },
                selectedIssue:
                    state.selectedIssue?.id === action.payload.issueId
                        ? {
                              ...state.selectedIssue,
                              status: action.payload.status,
                              notes: action.payload.notes,
                          }
                        : state.selectedIssue,
            };

        default:
            return state;
    }
}
