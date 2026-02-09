import {
    useEffect,
    useRef,
    useState,
    useCallback,
    type MutableRefObject,
} from 'react';
import { onMessage, sendMessage } from '@/services/messaging';
import { MessageType } from '@/types/messages';
import { ScanResult } from '@/types/issue';
import { useScanDispatch } from '@/app/context/useScanContext';

type ScanResultMessage = {
    type: string;
    data: { result?: ScanResult; error?: string; runId?: string };
};

function applyScanResult(
    message: ScanResultMessage,
    runIdRef: MutableRefObject<string | null>,
    processedRunIdRef: MutableRefObject<string | null>,
    animationDoneRef: MutableRefObject<boolean>,
    bufferedResultRef: MutableRefObject<ScanResult | null>,
    dispatch: ReturnType<typeof useScanDispatch>,
    setIsAnimating: (v: boolean) => void
): boolean {
    const runId = message.data.runId ?? null;
    if (runId !== null && runIdRef.current !== runId) return false;
    if (runId !== null && processedRunIdRef.current === runId) return false;

    if (message.type === MessageType.SCAN_COMPLETE) {
        const result = message.data.result as ScanResult;
        if (!result) return false;
        processedRunIdRef.current = runId;
        if (!animationDoneRef.current) {
            bufferedResultRef.current = result;
            return true;
        }
        dispatch({ type: 'SCAN_COMPLETE', payload: result });
        setIsAnimating(false);
        return true;
    }

    if (message.type === MessageType.SCAN_ERROR) {
        processedRunIdRef.current = runId;
        dispatch({ type: 'SCAN_ERROR', payload: message.data.error ?? '' });
        setIsAnimating(false);
        return true;
    }

    return false;
}

export function useScanWithAnimation() {
    const dispatch = useScanDispatch();
    const [isAnimating, setIsAnimating] = useState(false);
    const runIdRef = useRef<string | null>(null);
    const processedRunIdRef = useRef<string | null>(null);
    const animationDoneRef = useRef(false);
    const bufferedResultRef = useRef<ScanResult | null>(null);

    const handleScan = useCallback(async () => {
        try {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            const activeTab = tabs[0];
            if (!activeTab?.url) throw new Error('No active tab found');

            const runId = Date.now().toString();
            runIdRef.current = runId;
            processedRunIdRef.current = null;
            animationDoneRef.current = false;
            bufferedResultRef.current = null;
            setIsAnimating(true);

            dispatch({ type: 'SCAN_START', payload: activeTab.url });

            await sendMessage({
                type: MessageType.SCAN_REQUEST,
                data: { url: activeTab.url, runId },
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
    }, [dispatch]);

    const handleRefresh = useCallback(async () => {
        try {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            const activeTab = tabs[0];
            if (!activeTab?.url) throw new Error('No active tab found');

            const runId = Date.now().toString();
            runIdRef.current = runId;
            processedRunIdRef.current = null;
            animationDoneRef.current = false;
            bufferedResultRef.current = null;
            setIsAnimating(true);

            dispatch({
                type: 'RESET_AND_START_SCAN',
                payload: activeTab.url,
            });

            await sendMessage({
                type: MessageType.SCAN_REQUEST,
                data: { url: activeTab.url, runId },
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
    }, [dispatch]);

    const handleAnimationComplete = useCallback(() => {
        animationDoneRef.current = true;
        if (bufferedResultRef.current) {
            dispatch({
                type: 'SCAN_COMPLETE',
                payload: bufferedResultRef.current,
            });
            bufferedResultRef.current = null;
            if (runIdRef.current) processedRunIdRef.current = runIdRef.current;
        }
        setIsAnimating(false);
    }, [dispatch]);

    const apply = useCallback(
        (message: ScanResultMessage) => {
            applyScanResult(
                message,
                runIdRef,
                processedRunIdRef,
                animationDoneRef,
                bufferedResultRef,
                dispatch,
                setIsAnimating
            );
        },
        [dispatch]
    );

    useEffect(() => {
        const unsubscribe = onMessage(message => {
            if (
                message.type === MessageType.SCAN_COMPLETE ||
                message.type === MessageType.SCAN_ERROR
            ) {
                apply(message as ScanResultMessage);
            }
        });
        return unsubscribe;
    }, [apply]);

    useEffect(() => {
        const port = chrome.runtime.connect({ name: 'app' });
        const listener = (message: ScanResultMessage) => apply(message);
        port.onMessage.addListener(listener);
        return () => port.disconnect();
    }, [apply]);

    return {
        handleScan,
        handleRefresh,
        handleAnimationComplete,
        isAnimating,
    };
}
