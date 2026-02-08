import { useScanState } from '@/app/context/useScanContext';

export function HeaderTitle() {
    const { currentScan } = useScanState();

    return (
        <div>
            <h1 className="text-lg font-semibold">Accessibility Audit</h1>
            {currentScan && (
                <p className="text-xs text-muted-foreground">
                    {new URL(currentScan.url).hostname} •{' '}
                    {new Date(currentScan.timestamp).toLocaleTimeString()}
                </p>
            )}
        </div>
    );
}
