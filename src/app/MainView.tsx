import { useScanState, useViewMode } from '@/app/context/useScanContext';
import { ScanActionsProvider } from '@/app/context/ScanActionsContext';
import {
    useScanWithAnimation,
    useTabUrlSync,
    useAppConnection,
} from '@/app/hooks';
import { MainContent } from '@/app/components/MainContent';
import { ScanningState } from '@/app/components/ScanningState';
import { EmptyState } from '@/app/components/EmptyState';
import { ZeroResultsState } from '@/app/components/ZeroResultsState';

export default function MainView() {
    const { hasScannedOnce, isScanning, currentScan, currentUrl } =
        useScanState();
    const viewMode = useViewMode();
    const { handleScan, handleRefresh, handleAnimationComplete, isAnimating } =
        useScanWithAnimation();

    useTabUrlSync();
    useAppConnection();

    const scanActions = { handleScan, handleRefresh };

    return (
        <ScanActionsProvider value={scanActions}>
            {!hasScannedOnce && !isAnimating ? (
                <EmptyState onScan={handleScan} isScanning={isScanning} />
            ) : isAnimating ? (
                <ScanningState
                    currentUrl={currentUrl}
                    onAnimationComplete={handleAnimationComplete}
                />
            ) : viewMode === 'issues' && currentScan?.issues.length === 0 ? (
                <ZeroResultsState />
            ) : (
                <MainContent />
            )}
        </ScanActionsProvider>
    );
}
