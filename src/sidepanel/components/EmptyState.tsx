import { Button } from './ui/button';
import { Play, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
    onScan: () => void;
    isScanning: boolean;
    error?: string | null;
}

export default function EmptyState({
    onScan,
    isScanning,
    error,
}: EmptyStateProps) {
    return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            {error ? (
                <>
                    <AlertCircle className="mb-4 h-16 w-16 text-destructive" />
                    <h2 className="mb-2 text-xl font-semibold">Scan Failed</h2>
                    <p className="mb-4 max-w-md text-muted-foreground">
                        {error}
                    </p>
                    <Button onClick={onScan} disabled={isScanning}>
                        <Play className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                </>
            ) : (
                <>
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Play className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="mb-2 text-xl font-semibold">
                        No Scan Results
                    </h2>
                    <p className="mb-4 max-w-md text-muted-foreground">
                        Run an accessibility scan on the current page to
                        identify issues and get actionable recommendations.
                    </p>
                    <Button onClick={onScan} disabled={isScanning}>
                        <Play className="mr-2 h-4 w-4" />
                        {isScanning ? 'Scanning...' : 'Run Your First Scan'}
                    </Button>
                </>
            )}
        </div>
    );
}
