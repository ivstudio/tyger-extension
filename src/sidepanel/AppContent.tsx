import { useEffect } from 'react';
import { onMessage } from '@/lib/messaging';
import { MessageType } from '@/types/messages';
import { ScanResult } from '@/types/issue';
import { useScanDispatch } from './context/ScanContext';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { IssueList } from './components/IssueList';
import { IssueDetail } from './components/IssueDetail';

export default function AppContent() {
    const dispatch = useScanDispatch();

    useEffect(() => {
        const unsubscribe = onMessage(message => {
            if (message.type === MessageType.SCAN_COMPLETE) {
                dispatch({
                    type: 'SCAN_COMPLETE',
                    payload: message.data.result as ScanResult,
                });
            } else if (message.type === MessageType.SCAN_ERROR) {
                dispatch({
                    type: 'SCAN_ERROR',
                    payload: message.data.error,
                });
            }
        });
        return unsubscribe;
    }, [dispatch]);

    return (
        <div className="flex h-screen flex-col bg-background">
            <Header />
            <FilterBar />
            <div className="flex flex-1 overflow-hidden">
                <div className="w-2/5 overflow-y-auto border-r border-border">
                    <IssueList />
                </div>
                <div className="flex-1 overflow-y-auto">
                    <IssueDetail />
                </div>
            </div>
        </div>
    );
}
