import { Button } from '../ui/Button';
import { Play } from 'lucide-react';

interface EmptyStateProps {
    onScan: () => void;
    isScanning: boolean;
}

export default function EmptyState({ onScan, isScanning }: EmptyStateProps) {
    return (
        <div className="flex h-full w-full justify-center px-8 pt-24">
            <div className="max-w-lg text-left">
                <h2 className="mb-4 text-2xl font-semibold leading-tight">
                    Run an accessibility scan on the current page
                </h2>
                <p className="mb-2 text-base leading-relaxed text-muted-foreground">
                    This scan analyzes the currently visible page for common
                    accessibility issues aligned with WCAG guidelines.
                </p>
                <p className="mb-8 text-base leading-relaxed text-muted-foreground">
                    Results and recommendations will appear here once the scan
                    is complete.
                </p>

                <Button
                    onClick={onScan}
                    disabled={isScanning}
                    className="mb-10 gap-2"
                >
                    <Play className="h-4 w-4" />
                    {isScanning ? 'Scanning...' : 'Run Scan'}
                </Button>

                <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        What this scan checks
                    </h3>
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                        <li>Color contrast and text readability</li>
                        <li>Missing or incorrect labels</li>
                        <li>Keyboard focus and navigation issues</li>
                        <li>Invalid or incomplete ARIA attributes</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
