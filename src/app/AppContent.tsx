import { useEffect, useRef } from 'react';
import { onMessage } from '@/services/messaging';
import { MessageType } from '@/types/messages';
import { ScanResult } from '@/types/issue';
import { useScanDispatch } from './context/ScanContext';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { IssueList } from './components/IssueList';
import { IssueDetail } from './components/IssueDetail';

export default function AppContent() {
    const dispatch = useScanDispatch();
    const currentTabUrl = useRef<string | null>(null);

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

    // Establish connection to worker for cleanup on close
    useEffect(() => {
        // When app closes, the connection disconnects and worker
        // will detect it and clear highlights on the page
        const port = chrome.runtime.connect({ name: 'app' });

        return () => port.disconnect();
    }, []);

    // Reset state when user navigates to a different page
    useEffect(() => {
        const handleTabUpdate = (
            _tabId: number,
            changeInfo: { url?: string },
            tab: chrome.tabs.Tab
        ) => {
            // Only respond to URL changes on the active tab in the current window
            if (changeInfo.url && tab.active) {
                // If we had a previous URL and it changed, reset the state
                if (
                    currentTabUrl.current !== null &&
                    currentTabUrl.current !== changeInfo.url
                ) {
                    dispatch({ type: 'RESET' });
                }
                currentTabUrl.current = changeInfo.url;
            }
        };

        // Get initial tab URL
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            if (tabs[0]?.url) {
                currentTabUrl.current = tabs[0].url;
            }
        });

        chrome.tabs.onUpdated.addListener(handleTabUpdate);
        return () => chrome.tabs.onUpdated.removeListener(handleTabUpdate);
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
