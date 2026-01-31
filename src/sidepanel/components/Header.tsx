import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Play, Download, Settings } from 'lucide-react';
import { useScanState, useScanDispatch } from '../context/ScanContext';
import { sendMessage } from '@/lib/messaging';
import { MessageType } from '@/types/messages';
import { downloadJSON } from '@/lib/export';

export default function Header() {
  const { currentScan, isScanning } = useScanState();
  const dispatch = useScanDispatch();

  const handleExport = () => {
    if (currentScan) {
      downloadJSON(currentScan);
    }
  };

  const handleScan = async () => {
    dispatch({ type: 'SCAN_START' });

    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];

      if (!activeTab?.url) {
        throw new Error('No active tab found');
      }

      await sendMessage({
        type: MessageType.SCAN_REQUEST,
        data: {
          url: activeTab.url,
          runId: Date.now().toString()
        }
      });
    } catch (error) {
      dispatch({
        type: 'SCAN_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to start scan'
      });
    }
  };

  return (
    <header className="border-b border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Accessibility Audit</h1>
          {currentScan && (
            <p className="text-xs text-muted-foreground">
              {new URL(currentScan.url).hostname} •{' '}
              {new Date(currentScan.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleScan}
            disabled={isScanning}
            size="sm"
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {isScanning ? 'Scanning...' : 'Run Scan'}
          </Button>

          {currentScan && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          )}

          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {currentScan && (
        <div className="mt-3 flex gap-2">
          <Badge variant="outline" className="severity-critical">
            Critical: {currentScan.summary.bySeverity.critical}
          </Badge>
          <Badge variant="outline" className="severity-serious">
            Serious: {currentScan.summary.bySeverity.serious}
          </Badge>
          <Badge variant="outline" className="severity-moderate">
            Moderate: {currentScan.summary.bySeverity.moderate}
          </Badge>
          <Badge variant="outline" className="severity-minor">
            Minor: {currentScan.summary.bySeverity.minor}
          </Badge>
        </div>
      )}
    </header>
  );
}
