import { Button } from '../ui/Button';
import { ShieldCheck, Zap, Eye, Keyboard, FileText } from 'lucide-react';
import { PageToScanUrl } from './PageToScanUrl';

interface EmptyStateProps {
    onScan: () => void;
    isScanning: boolean;
}

const SCAN_FEATURES = [
    { icon: Eye, label: 'Color Contrast' },
    { icon: Keyboard, label: 'Keyboard Navigation' },
    { icon: FileText, label: 'ARIA Labels' },
    { icon: ShieldCheck, label: 'WCAG Compliance' },
] as const;

export default function EmptyState({ onScan, isScanning }: EmptyStateProps) {
    return (
        <div className="flex h-full flex-col">
            {/* Main content area */}
            <div className="flex-1 overflow-y-auto px-8 pt-12 pb-32">
                <div className="flex flex-col items-center text-center">
                    {/* Shield icon */}
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                        <ShieldCheck className="h-8 w-8 text-primary-foreground" />
                    </div>

                    {/* Title */}
                    <h2 className="mb-2 text-2xl font-bold text-foreground">
                        Accessibility Scanner
                    </h2>

                    {/* Description */}
                    <p className="mb-8 text-base leading-snug text-muted-foreground">
                        Analyze your page for accessibility issues
                        <br />
                        and get actionable recommendations to improve
                        compliance.
                    </p>

                    <PageToScanUrl />

                    {/* What we scan for section */}
                    <div className="w-full text-left">
                        <p className="mb-3 text-xs font-medium text-muted-foreground">
                            What we scan for
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {SCAN_FEATURES.map(({ icon: Icon, label }) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
                                >
                                    <Icon className="h-4 w-4 text-primary" />
                                    <span className="text-sm text-foreground">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed bottom section */}
            <div className="fixed right-0 bottom-0 left-0 border-t border-border bg-background px-8 pt-4 pb-6">
                <Button
                    onClick={onScan}
                    disabled={isScanning}
                    size="lg"
                    className="w-full gap-2"
                >
                    <Zap className="h-5 w-5" />
                    {isScanning ? 'Scanning...' : 'Start Accessibility Scan'}
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                    Scans typically complete in under 5 seconds
                </p>
            </div>
        </div>
    );
}
