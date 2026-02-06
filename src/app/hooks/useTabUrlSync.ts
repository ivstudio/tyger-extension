import { useEffect, useRef } from 'react';
import { useScanDispatch } from '@/app/context/useScanContext';

export function useTabUrlSync() {
    const dispatch = useScanDispatch();
    const currentTabUrl = useRef<string | null>(null);

    useEffect(() => {
        const handleTabUpdate = (
            _tabId: number,
            changeInfo: { url?: string },
            tab: chrome.tabs.Tab
        ) => {
            if (changeInfo.url && tab.active) {
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

        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            if (tabs[0]?.url) {
                currentTabUrl.current = tabs[0].url;
                dispatch({ type: 'SET_CURRENT_URL', payload: tabs[0].url });
            }
        });

        chrome.tabs.onUpdated.addListener(handleTabUpdate);
        return () => chrome.tabs.onUpdated.removeListener(handleTabUpdate);
    }, [dispatch]);
}
