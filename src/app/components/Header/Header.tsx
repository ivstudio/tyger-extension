import { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsList, TabsTrigger } from '../ui/Tabs';
import {
    Play,
    Download,
    Settings,
    Target,
    EyeOff,
    AlertCircle,
    ClipboardList,
} from 'lucide-react';
import {
    useScanState,
    useScanDispatch,
    useViewMode,
    useChecklist,
} from '../../context/ScanContext';
import { sendMessage } from '@/services/messaging';
import { MessageType } from '@/types/messages';
import { downloadJSON } from '@/services/export';

export default function Header() {
    const { currentScan, isScanning } = useScanState();
    const viewMode = useViewMode();
    const checklist = useChecklist();
    const dispatch = useScanDispatch();
    const [pickerActive, setPickerActive] = useState(false);

    const handleExport = () => {
        if (currentScan) {
            downloadJSON(currentScan, checklist || undefined);
        }
    };

    const handleTogglePicker = async () => {
        const newState = !pickerActive;
        setPickerActive(newState);

        await sendMessage({
            type: MessageType.TOGGLE_PICKER,
            data: { enabled: newState },
        }).catch(err => console.error('Failed to toggle picker:', err));
    };

    const handleClearHighlights = async () => {
        await sendMessage({
            type: MessageType.CLEAR_HIGHLIGHTS,
        }).catch(err => console.error('Failed to clear highlights:', err));
    };

    const handleScan = async () => {
        dispatch({ type: 'SCAN_START' });

        try {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            const activeTab = tabs[0];

            if (!activeTab?.url) {
                throw new Error('No active tab found');
            }

            await sendMessage({
                type: MessageType.SCAN_REQUEST,
                data: {
                    url: activeTab.url,
                    runId: Date.now().toString(),
                },
            });
        } catch (error) {
            dispatch({
                type: 'SCAN_ERROR',
                payload:
                    error instanceof Error
                        ? error.message
                        : 'Failed to start scan',
            });
        }
    };

    return (
        <header className="border-b border-border bg-card px-4 py-3">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold">
                        Accessibility Audit
                    </h1>
                    {currentScan && (
                        <p className="text-xs text-muted-foreground">
                            {new URL(currentScan.url).hostname} •{' '}
                            {new Date(
                                currentScan.timestamp
                            ).toLocaleTimeString()}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleScan}
                        disabled={isScanning}
                        size="sm"
                        className="gap-2"
                    >
                        <Play className="h-4 w-4" />
                        {isScanning ? 'Scanning...' : 'Run Scan'}
                    </Button>

                    {currentScan && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleTogglePicker}
                                className={
                                    pickerActive
                                        ? 'bg-primary text-primary-foreground'
                                        : ''
                                }
                                title="Pick element on page"
                            >
                                <Target className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearHighlights}
                                title="Clear highlights"
                            >
                                <EyeOff className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExport}
                                title="Export as JSON"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </>
                    )}

                    <Button variant="ghost" size="sm" title="Settings">
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {currentScan && (
                <>
                    <div className="mt-3">
                        <Tabs
                            value={viewMode}
                            onValueChange={value =>
                                dispatch({
                                    type: 'SET_VIEW_MODE',
                                    payload: value as 'issues' | 'checklist',
                                })
                            }
                        >
                            <TabsList>
                                <TabsTrigger value="issues" className="gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Issues
                                </TabsTrigger>
                                <TabsTrigger
                                    value="checklist"
                                    className="gap-2"
                                >
                                    <ClipboardList className="h-4 w-4" />
                                    Checklist
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {viewMode === 'issues' && (
                        <div className="mt-3 flex gap-2">
                            <Badge
                                variant="outline"
                                className="severity-critical"
                            >
                                Critical:{' '}
                                {currentScan.summary.bySeverity.critical}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="severity-serious"
                            >
                                Serious:{' '}
                                {currentScan.summary.bySeverity.serious}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="severity-moderate"
                            >
                                Moderate:{' '}
                                {currentScan.summary.bySeverity.moderate}
                            </Badge>
                            <Badge variant="outline" className="severity-minor">
                                Minor: {currentScan.summary.bySeverity.minor}
                            </Badge>
                        </div>
                    )}
                </>
            )}
        </header>
    );
}
