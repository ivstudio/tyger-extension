import { useEffect } from 'react';

export function useAppConnection() {
    useEffect(() => {
        const port = chrome.runtime.connect({ name: 'app' });
        return () => port.disconnect();
    }, []);
}
