import { useEffect } from 'react';
import {
    useChecklist,
    useScanDispatch,
    useScanState,
    useIncompleteChecks,
} from '../../context/useScanContext';
import { Accordion } from '../ui/Accordion';
import { ChecklistCategory } from './ChecklistCategory';
import { ChecklistItemStatus, DEFAULT_CHECKLISTS } from '@/types/checklist';
import { getLatestChecklist, saveChecklist } from '@/services/storage';
import { Button } from '../ui/Button';
import { RotateCcw, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { sendMessage } from '@/services/messaging';
import { MessageType } from '@/types/messages';

export function ChecklistView() {
    const checklist = useChecklist();
    const dispatch = useScanDispatch();
    const { currentScan } = useScanState();
    const incompleteChecks = useIncompleteChecks();

    useEffect(() => {
        const loadChecklist = async () => {
            if (!currentScan) return;

            // Try to load existing checklist for this URL
            const existingChecklist = await getLatestChecklist(currentScan.url);

            if (existingChecklist) {
                dispatch({
                    type: 'LOAD_CHECKLIST',
                    payload: existingChecklist,
                });
            } else {
                // Create new checklist from defaults
                const categories = [...DEFAULT_CHECKLISTS];

                // Add incomplete checks category if any exist
                if (incompleteChecks.length > 0) {
                    categories.unshift({
                        id: 'automated-incomplete',
                        title: 'Automated Checks Requiring Review',
                        description:
                            'Issues flagged by automated scanning that need manual verification',
                        items: incompleteChecks.map(issue => ({
                            id: issue.id,
                            title: issue.title,
                            description: issue.description,
                            status: 'pending' as ChecklistItemStatus,
                            notes: issue.notes,
                        })),
                    });
                }

                const newChecklist = {
                    url: currentScan.url,
                    timestamp: Date.now(),
                    categories,
                    completed: false,
                };
                dispatch({ type: 'LOAD_CHECKLIST', payload: newChecklist });
            }
        };

        loadChecklist();
    }, [currentScan, dispatch, incompleteChecks]);

    const handleItemStatusChange = (
        categoryId: string,
        itemId: string,
        status: ChecklistItemStatus,
        notes?: string
    ) => {
        dispatch({
            type: 'UPDATE_CHECKLIST_ITEM',
            payload: { categoryId, itemId, status, notes },
        });
    };

    const handleItemClick = (categoryId: string, itemId: string) => {
        // Only handle clicks for automated-incomplete category
        if (categoryId !== 'automated-incomplete') return;

        // Find the corresponding issue from incomplete checks
        const issue = incompleteChecks.find(i => i.id === itemId);
        if (!issue) return;

        // Select the issue in state
        dispatch({
            type: 'SELECT_ISSUE',
            payload: issue,
        });

        // Send message to highlight the issue on the page
        sendMessage({
            type: MessageType.HIGHLIGHT_ISSUE,
            data: { issueId: issue.id },
        });
    };

    // Save checklist whenever it changes
    useEffect(() => {
        if (checklist) {
            saveChecklist(checklist).catch(err =>
                console.error('Failed to save checklist:', err)
            );
        }
    }, [checklist]);

    const handleResetChecklist = async () => {
        if (!currentScan) return;

        const resetChecklist = {
            url: currentScan.url,
            timestamp: Date.now(),
            categories: DEFAULT_CHECKLISTS,
            completed: false,
        };

        dispatch({ type: 'LOAD_CHECKLIST', payload: resetChecklist });
        await saveChecklist(resetChecklist);
    };

    if (!currentScan) {
        return (
            <div className="flex h-full items-center justify-center p-8 text-center">
                <div className="space-y-2">
                    <p className="text-muted-foreground">
                        Run a scan first to begin manual validation
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Manual checklists help verify accessibility features
                        that automated tools can't detect
                    </p>
                </div>
            </div>
        );
    }

    if (!checklist) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Loading checklist...</p>
            </div>
        );
    }

    const totalItems = checklist.categories.reduce(
        (sum, cat) => sum + cat.items.length,
        0
    );
    const completedItems = checklist.categories.reduce(
        (sum, cat) =>
            sum + cat.items.filter(item => item.status !== 'pending').length,
        0
    );
    const passedItems = checklist.categories.reduce(
        (sum, cat) =>
            sum + cat.items.filter(item => item.status === 'pass').length,
        0
    );
    const failedItems = checklist.categories.reduce(
        (sum, cat) =>
            sum + cat.items.filter(item => item.status === 'fail').length,
        0
    );
    const completionPercentage = Math.round(
        (completedItems / totalItems) * 100
    );

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="space-y-3 border-b border-border p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Manual Validation</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetChecklist}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                </div>

                {/* Progress Summary */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            Overall Progress
                        </span>
                        <div className="flex items-center gap-2">
                            {checklist.completed && (
                                <Badge
                                    variant="default"
                                    className="bg-green-600"
                                >
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Complete
                                </Badge>
                            )}
                            <span className="font-medium">
                                {completedItems} / {totalItems}
                            </span>
                        </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                    <div className="flex gap-2 text-xs">
                        {passedItems > 0 && (
                            <Badge variant="default" className="bg-green-600">
                                {passedItems} passed
                            </Badge>
                        )}
                        {failedItems > 0 && (
                            <Badge variant="destructive">
                                {failedItems} failed
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Checklist Categories */}
            <div className="flex-1 overflow-y-auto p-4">
                <Accordion type="multiple" className="space-y-2">
                    {checklist.categories.map(category => (
                        <ChecklistCategory
                            key={category.id}
                            category={category}
                            onItemStatusChange={handleItemStatusChange}
                            onItemClick={handleItemClick}
                        />
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
