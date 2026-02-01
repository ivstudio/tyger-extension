import { CheckCircle } from 'lucide-react';

export function ZeroResultsState() {
    return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-3 max-w-lg text-xl font-semibold">
                No automatically detectable accessibility issues were found in
                this scan. Manual testing is still recommended.
            </h2>
            <p className="mb-6 max-w-md text-muted-foreground">
                Automated scans don't catch everything. Pair this scan with a
                few quick manual checks to catch issues that require human
                review.
            </p>
            <div className="w-full max-w-sm rounded-lg border border-border bg-muted/30 p-4 text-left">
                <h3 className="mb-3 text-sm font-semibold">
                    Recommended manual checks
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                        <span className="shrink-0">⌨️</span>
                        <span>Navigate the page using only a keyboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="shrink-0">🔍</span>
                        <span>Zoom to 200% and check content reflow</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="shrink-0">👁️</span>
                        <span>Review focus states and visible labels</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
