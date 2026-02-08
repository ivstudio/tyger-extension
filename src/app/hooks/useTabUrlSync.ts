import { useEffect, useRef } from 'react';
import { useScanDispatch } from '@/app/context/useScanContext';
import { onMessage, sendMessage } from '@/services/messaging';
import { MessageType } from '@/types/messages';

function isCurrentUrlUpdate(
    msg: unknown
): msg is { type: string; data?: { url?: string } } {
    return (
        typeof msg === 'object' &&
        msg !== null &&
        (msg as { type?: string }).type === MessageType.CURRENT_URL_UPDATE &&
        typeof (msg as { data?: { url?: string } }).data?.url === 'string'
    );
}

export function useTabUrlSync() {
    const dispatch = useScanDispatch();
    const currentTabUrl = useRef<string | null>(null);

    useEffect(() => {
        const applyUrl = (url: string) => {
            if (
                currentTabUrl.current !== null &&
                currentTabUrl.current !== url
            ) {
                dispatch({ type: 'RESET' });
            }
            currentTabUrl.current = url;
            dispatch({ type: 'SET_CURRENT_URL', payload: url });
        };

        const unsubscribe = onMessage(message => {
            if (
                message.type === MessageType.CURRENT_URL_UPDATE &&
                message.data?.url
            ) {
                applyUrl(message.data.url);
            }
        });

        const port = chrome.runtime.connect({ name: 'app' });
        const portListener = (message: unknown) => {
            if (isCurrentUrlUpdate(message)) {
                applyUrl(message.data!.url!);
            }
        };
        port.onMessage.addListener(portListener);

        sendMessage({ type: MessageType.GET_CURRENT_URL }).catch(() => {});

        return () => {
            unsubscribe();
            port.onMessage.removeListener(portListener);
            port.disconnect();
        };
    }, [dispatch]);
}
