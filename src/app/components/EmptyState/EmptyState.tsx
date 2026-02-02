import { Button } from '../ui/Button';
import { Play } from 'lucide-react';

interface EmptyStateProps {
    onScan: () => void;
    isScanning: boolean;
    currentUrl: string | null;
}

export default function EmptyState({
    onScan,
    isScanning,
    currentUrl,
}: EmptyStateProps) {
    const getDisplayUrl = (url: string | null) => {
        if (!url) return null;
        try {
            const urlObj = new URL(url);
            return urlObj.hostname + urlObj.pathname;
        } catch {
            return url;
        }
    };

    const sectionGap = 'mb-5';
    const headerGap = 'mb-2';

    return (
        <div className="flex h-full w-full justify-center px-8 pt-20">
            <div className="max-w-xl text-left">
                <h2
                    className={`max-w-3xl text-3xl leading-tight font-bold ${headerGap}`}
                >
                    Accessibility review
                </h2>
                <p
                    className={`text-base leading-relaxed text-muted-foreground ${sectionGap}`}
                >
                    Highlights accessibility issues on the page and shows what
                    needs to be fixed.
                </p>
                {currentUrl && (
                    <div className={sectionGap}>
                        <p className="mb-1.5 text-sm font-medium text-muted-foreground">
                            Target page:
                        </p>
                        <div className="rounded-md border border-border bg-muted/50 px-4 py-3">
                            <p className="font-mono text-sm break-all text-foreground">
                                {getDisplayUrl(currentUrl)}
                            </p>
                        </div>
                    </div>
                )}

                <Button
                    onClick={onScan}
                    disabled={isScanning}
                    size="lg"
                    className="gap-2"
                >
                    <Play className="h-5 w-5" />
                    {isScanning ? 'Scanning...' : 'Scan this page'}
                </Button>

                {/* <div>
                    <h3 className="mb-3 text-base font-bold tracking-wide text-foreground">
                        What this scan checks:
                    </h3>
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                        <li>Color contrast and text readability</li>
                        <li>Missing or incorrect labels</li>
                        <li>Keyboard focus and navigation issues</li>
                        <li>Invalid or incomplete ARIA attributes</li>
                    </ul>
                </div> */}
            </div>
        </div>
    );
}
