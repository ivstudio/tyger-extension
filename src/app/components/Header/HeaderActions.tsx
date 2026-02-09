import { useState } from 'react';
import { RefreshCw, Download, Settings, Target, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { useScanState, useChecklist } from '@/app/context/useScanContext';
import { useScanActions } from '@/app/context/ScanActionsContext';
import { sendMessage } from '@/services/messaging';
import { MessageType } from '@/types/messages';
import { downloadJSON } from '@/services/export';

export function HeaderActions() {
    const { currentScan, isScanning } = useScanState();
    const checklist = useChecklist();
    const { handleRefresh } = useScanActions();
    const [pickerActive, setPickerActive] = useState(false);

    const handleExport = () => {
        if (currentScan) {
            downloadJSON(currentScan, checklist ?? undefined);
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

    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={handleRefresh}
                disabled={isScanning}
                size="sm"
                className="gap-2"
            >
                <RefreshCw className="h-4 w-4" />
                {isScanning ? 'Scanning...' : 'Refresh'}
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
    );
}
