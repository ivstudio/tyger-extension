import { useState } from 'react';
import { Button } from './ui/button';
import { Download, Copy, Check } from 'lucide-react';
import { ScanResult } from '@/types/issue';
import { ManualChecklist } from '@/types/checklist';
import { downloadJSON, copyToClipboard, getEstimatedSize } from '@/lib/export';

interface ExportDialogProps {
  scan: ScanResult;
  checklist?: ManualChecklist;
}

export default function ExportDialog({ scan, checklist }: ExportDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    downloadJSON(scan, checklist);
  };

  const handleCopy = async () => {
    await copyToClipboard(scan, checklist);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fileSize = getEstimatedSize(scan, checklist);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Export Results</h3>
        <p className="text-sm text-muted-foreground">
          Download or copy the scan results as JSON. Size: {fileSize}
        </p>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleDownload} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download JSON
        </Button>
        <Button onClick={handleCopy} variant="outline" className="flex-1">
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </>
          )}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>Includes:</p>
        <ul className="list-disc list-inside ml-2 mt-1">
          <li>{scan.issues.length} issues</li>
          <li>WCAG criteria and recommendations</li>
          <li>Element selectors and context</li>
          {checklist && <li>Manual checklist results</li>}
        </ul>
      </div>
    </div>
  );
}
