import { Button } from './ui/button';
import { Play, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  onScan: () => void;
  isScanning: boolean;
  error?: string | null;
}

export default function EmptyState({ onScan, isScanning, error }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {error ? (
        <>
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Scan Failed</h2>
          <p className="text-muted-foreground mb-4 max-w-md">{error}</p>
          <Button onClick={onScan} disabled={isScanning}>
            <Play className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </>
      ) : (
        <>
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Play className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Scan Results</h2>
          <p className="text-muted-foreground mb-4 max-w-md">
            Run an accessibility scan on the current page to identify issues and get
            actionable recommendations.
          </p>
          <Button onClick={onScan} disabled={isScanning}>
            <Play className="h-4 w-4 mr-2" />
            {isScanning ? 'Scanning...' : 'Run Your First Scan'}
          </Button>
        </>
      )}
    </div>
  );
}
