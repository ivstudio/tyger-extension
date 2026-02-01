import { useEffect, useRef } from 'react';
import { onMessage } from '@/lib/messaging';
import { MessageType } from '@/types/messages';
import { ScanResult } from '@/types/issue';
import { ScanProvider, useScanDispatch } from './context/ScanContext';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import IssueList from './components/IssueList';
import IssueDetail from './components/IssueDetail';

function AppContent() {
    const dispatch = useScanDispatch();
    const currentTabUrl = useRef<string | null>(null);

    useEffect(() => {
        // Listen for scan results from content script
        onMessage(message => {
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
    }, [dispatch]);

    // Establish connection to background script for cleanup on close
    useEffect(() => {
        // When sidepanel closes, the connection disconnects and background
        // script will detect it and clear highlights on the page
        const port = chrome.runtime.connect({ name: 'sidepanel' });

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

export default function App() {
    return (
        <ScanProvider>
            <AppContent />
        </ScanProvider>
    );
}
