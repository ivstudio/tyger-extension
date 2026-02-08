import { useEffect, useRef } from 'react';
import { useScanState } from '../context/useScanContext';
import { sendMessage } from '@/services/messaging';
import { MessageType } from '@/types/messages';

/**
 * Automatically clears page highlights when context changes.
 *
 * Clears highlights when:
 * - Scan starts (isScanning becomes true)
 * - URL changes (new page scanned)
 * - View mode switches (Automated ↔ Manual Checks)
 *
 * This centralizes highlight clearing logic in one place for maintainability.
 */
export function useClearHighlights(): void {
    const { isScanning, currentScan, viewMode } = useScanState();
    const previousUrlRef = useRef<string | undefined>(undefined);
    const previousViewModeRef = useRef(viewMode);

    // Clear when scan starts
    useEffect(() => {
        if (isScanning) {
            sendMessage({
                type: MessageType.CLEAR_HIGHLIGHTS,
            });
        }
    }, [isScanning]);

    // Clear when URL changes (new page scanned)
    useEffect(() => {
        const currentUrl = currentScan?.url;

        if (
            currentUrl &&
            previousUrlRef.current &&
            currentUrl !== previousUrlRef.current
        ) {
            sendMessage({
                type: MessageType.CLEAR_HIGHLIGHTS,
            });
        }

        previousUrlRef.current = currentUrl;
    }, [currentScan?.url]);

    // Clear when view mode changes
    useEffect(() => {
        if (previousViewModeRef.current !== viewMode) {
            sendMessage({
                type: MessageType.CLEAR_HIGHLIGHTS,
            });
        }

        previousViewModeRef.current = viewMode;
    }, [viewMode]);
}
