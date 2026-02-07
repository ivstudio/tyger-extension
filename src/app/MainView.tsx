import { useScanState, useViewMode } from '@/app/context/useScanContext';
import {
    useScanWithAnimation,
    useTabUrlSync,
    useAppConnection,
} from '@/app/hooks';
import { Header } from '@/app/components/Header';
import { MainContent } from '@/app/components/MainContent';
import { ScanningState } from '@/app/components/ScanningState';
import { EmptyState } from '@/app/components/EmptyState';
import { ZeroResultsState } from '@/app/components/ZeroResultsState';

export default function MainView() {
    const { hasScannedOnce, isScanning, currentScan, currentUrl } =
        useScanState();
    const viewMode = useViewMode();
    const { handleScan, handleAnimationComplete, isAnimating } =
        useScanWithAnimation();

    useTabUrlSync();
    useAppConnection();

    if (!hasScannedOnce && !isAnimating) {
        return (
            <EmptyState
                onScan={handleScan}
                isScanning={isScanning}
                currentUrl={currentUrl}
            />
        );
    }

    if (isAnimating) {
        return (
            <ScanningState
                currentUrl={currentUrl}
                onAnimationComplete={handleAnimationComplete}
            />
        );
    }

    if (
        viewMode === 'issues' &&
        currentScan &&
        currentScan.issues.length === 0
    ) {
        return <ZeroResultsState />;
    }

    return (
        <div className="flex h-screen flex-col bg-background">
            <Header />
            <MainContent viewMode={viewMode} />
        </div>
    );
}
