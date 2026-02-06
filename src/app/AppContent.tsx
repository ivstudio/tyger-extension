import { useEffect, useRef, useState, useCallback } from 'react';
import { onMessage, sendMessage } from '@/services/messaging';
import { MessageType } from '@/types/messages';
import { ScanResult } from '@/types/issue';
import {
    useScanState,
    useScanDispatch,
    useViewMode,
} from './context/ScanContext';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { IssueList } from './components/IssueList';
import { IssueDetail } from './components/IssueDetail';
import { ChecklistView } from './components/ChecklistView';
import EmptyState from './components/EmptyState/EmptyState';
import { ScanningState } from './components/ScanningState';
import { ZeroResultsState } from './components/ZeroResultsState';

export default function AppContent() {
    const { hasScannedOnce, isScanning, currentScan, currentUrl } =
        useScanState();
    const dispatch = useScanDispatch();
    const viewMode = useViewMode();
    const currentTabUrl = useRef<string | null>(null);

    // State for animation control
    const [isAnimating, setIsAnimating] = useState(false);
    const bufferedResultRef = useRef<ScanResult | null>(null);

    const handleScan = async () => {
        try {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            const activeTab = tabs[0];

            if (!activeTab?.url) {
                throw new Error('No active tab found');
            }

            // Start animation
            setIsAnimating(true);
            bufferedResultRef.current = null;

            dispatch({ type: 'SCAN_START', payload: activeTab.url });

            await sendMessage({
                type: MessageType.SCAN_REQUEST,
                data: {
                    url: activeTab.url,
                    runId: Date.now().toString(),
                },
            });
        } catch (error) {
            setIsAnimating(false);
            dispatch({
                type: 'SCAN_ERROR',
                payload:
                    error instanceof Error
                        ? error.message
                        : 'Failed to start scan',
            });
        }
    };

    const handleAnimationComplete = useCallback(() => {
        setIsAnimating(false);
        // If we have a buffered result, dispatch it now
        if (bufferedResultRef.current) {
            dispatch({
                type: 'SCAN_COMPLETE',
                payload: bufferedResultRef.current,
            });
            bufferedResultRef.current = null;
        }
    }, [dispatch]);

    useEffect(() => {
        const unsubscribe = onMessage(message => {
            if (message.type === MessageType.SCAN_COMPLETE) {
                const result = message.data.result as ScanResult;
                // If animation is playing, buffer the result
                if (isAnimating) {
                    bufferedResultRef.current = result;
                } else {
                    dispatch({
                        type: 'SCAN_COMPLETE',
                        payload: result,
                    });
                }
            } else if (message.type === MessageType.SCAN_ERROR) {
                setIsAnimating(false);
                dispatch({
                    type: 'SCAN_ERROR',
                    payload: message.data.error,
                });
            }
        });
        return unsubscribe;
    }, [dispatch, isAnimating]);

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
                dispatch({ type: 'SET_CURRENT_URL', payload: changeInfo.url });
            }
        };

        // Get initial tab URL
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            if (tabs[0]?.url) {
                currentTabUrl.current = tabs[0].url;
                dispatch({ type: 'SET_CURRENT_URL', payload: tabs[0].url });
            }
        });

        chrome.tabs.onUpdated.addListener(handleTabUpdate);
        return () => chrome.tabs.onUpdated.removeListener(handleTabUpdate);
    }, [dispatch]);

    // Determine which content to render
    const renderMainContent = () => {
        // Initial state - never scanned and not animating
        if (!hasScannedOnce && !isAnimating) {
            return (
                <EmptyState
                    onScan={handleScan}
                    isScanning={isScanning}
                    currentUrl={currentUrl}
                />
            );
        }

        // Currently scanning - show animated scanning state
        if (isAnimating) {
            return (
                <ScanningState
                    currentUrl={currentUrl}
                    onAnimationComplete={handleAnimationComplete}
                />
            );
        }

        // Scan complete with zero issues (only in issues view)
        if (
            viewMode === 'issues' &&
            currentScan &&
            currentScan.issues.length === 0
        ) {
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

    // Show header and filter bar only when not animating and has scanned
    const showHeader = hasScannedOnce && !isAnimating;

    return (
        <div className="flex h-screen flex-col bg-background">
            {showHeader && <Header />}
            {showHeader && viewMode === 'issues' && <FilterBar />}
            <div className="flex flex-1 justify-center overflow-hidden">
                {renderMainContent()}
            </div>
        </div>
    );
}
