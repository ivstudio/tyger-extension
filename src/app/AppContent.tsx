import { useEffect, useRef } from 'react';
import { onMessage, sendMessage } from '@/services/messaging';
import { MessageType } from '@/types/messages';
import { ScanResult } from '@/types/issue';
import { useScanState, useScanDispatch, useViewMode } from './context/ScanContext';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { IssueList, IssueListSkeleton } from './components/IssueList';
import { IssueDetail } from './components/IssueDetail';
import { ChecklistView } from './components/ChecklistView';
import EmptyState from './components/EmptyState/EmptyState';
import { ZeroResultsState } from './components/ZeroResultsState';
import { cn } from '@/services/utils';

export default function AppContent() {
    const { hasScannedOnce, isScanning, currentScan } = useScanState();
    const dispatch = useScanDispatch();
    const viewMode = useViewMode();
    const currentTabUrl = useRef<string | null>(null);

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

    // Determine which content to render
    const renderMainContent = () => {
        // Initial state - never scanned
        if (!hasScannedOnce) {
            return <EmptyState onScan={handleScan} isScanning={isScanning} />;
        }

        // Currently scanning - show skeleton
        if (isScanning) {
            return (
                <div className="flex flex-1 overflow-hidden">
                    <div
                        className={cn(
                            'w-2/5 overflow-y-auto border-r border-border',
                            'animate-fade-in'
                        )}
                    >
                        <IssueListSkeleton />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <IssueDetail />
                    </div>
                </div>
            );
        }

        // Scan complete with zero issues (only in issues view)
        if (viewMode === 'issues' && currentScan && currentScan.issues.length === 0) {
            return <ZeroResultsState />;
        }

        // Scan complete with issues - normal view
        return (
            <div className="flex flex-1 overflow-hidden">
                {viewMode === 'issues' ? (
                    <>
                        <div className="w-2/5 overflow-y-auto border-r border-border">
                            <IssueList />
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <IssueDetail />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <ChecklistView />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-screen flex-col bg-background">
            <Header />
            {hasScannedOnce && viewMode === 'issues' && <FilterBar />}
            <div className="flex flex-1 overflow-hidden">
                {renderMainContent()}
            </div>
        </div>
    );
}
