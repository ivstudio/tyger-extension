import { AlertCircle, ClipboardList } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../ui/Tabs';
import {
    useViewMode,
    useScanDispatch,
    type ViewMode,
} from '@/app/context/useScanContext';
import { sendMessage } from '@/services/messaging';
import { MessageType } from '@/types/messages';

export function ViewModeTabs() {
    const viewMode = useViewMode();
    const dispatch = useScanDispatch();

    const handleValueChange = (value: string) => {
        // Clear highlights on page
        sendMessage({
            type: MessageType.CLEAR_HIGHLIGHTS,
        });

        // Switch view mode (reducer automatically clears selected issue)
        dispatch({
            type: 'SET_VIEW_MODE',
            payload: value as ViewMode,
        });
    };

    return (
        <div className="mt-3">
            <Tabs value={viewMode} onValueChange={handleValueChange}>
                <TabsList>
                    <TabsTrigger value="issues" className="gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Automated Checks
                    </TabsTrigger>
                    <TabsTrigger value="checklist" className="gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Manual Checks
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}
