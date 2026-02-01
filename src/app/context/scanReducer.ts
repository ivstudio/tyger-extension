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

        case 'UPDATE_ISSUE_STATUS': {
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
        }

        case 'SET_VIEW_MODE':
            return {
                ...state,
                viewMode: action.payload,
            };

        case 'LOAD_CHECKLIST':
            return {
                ...state,
                currentChecklist: action.payload,
            };

        case 'UPDATE_CHECKLIST_ITEM': {
            if (!state.currentChecklist) return state;

            const updatedCategories = state.currentChecklist.categories.map(
                category =>
                    category.id === action.payload.categoryId
                        ? {
                              ...category,
                              items: category.items.map(item =>
                                  item.id === action.payload.itemId
                                      ? {
                                            ...item,
                                            status: action.payload.status,
                                            notes: action.payload.notes,
                                        }
                                      : item
                              ),
                          }
                        : category
            );

            // Check if all items are completed (not pending)
            const allCompleted = updatedCategories.every(category =>
                category.items.every(item => item.status !== 'pending')
            );

            return {
                ...state,
                currentChecklist: {
                    ...state.currentChecklist,
                    categories: updatedCategories,
                    completed: allCompleted,
                    timestamp: Date.now(),
                },
            };
        }

        case 'RESET_CHECKLIST':
            return {
                ...state,
                currentChecklist: null,
            };

        default:
            return state;
    }
}
