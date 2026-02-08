import { useScanState } from '@/app/context/useScanContext';

function getDisplayUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        return urlObj.host + urlObj.pathname;
    } catch {
        return url;
    }
}

export function PageToScanUrl() {
    const { currentUrl } = useScanState();

    if (!currentUrl) {
        return null;
    }

    return (
        <div className="mb-8 w-full text-left">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
                Page to scan
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <p className="font-mono text-sm break-all text-foreground">
                    {getDisplayUrl(currentUrl)}
                </p>
            </div>
        </div>
    );
}
