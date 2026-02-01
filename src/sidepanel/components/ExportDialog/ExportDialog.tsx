import { useState } from 'react';
import { Button } from '../ui/button';
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
        <div className="space-y-4 p-4">
            <div>
                <h3 className="mb-2 font-semibold">Export Results</h3>
                <p className="text-sm text-muted-foreground">
                    Download or copy the scan results as JSON. Size: {fileSize}
                </p>
            </div>

            <div className="flex gap-2">
                <Button onClick={handleDownload} className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download JSON
                </Button>
                <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="flex-1"
                >
                    {copied ? (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy to Clipboard
                        </>
                    )}
                </Button>
            </div>

            <div className="text-xs text-muted-foreground">
                <p>Includes:</p>
                <ul className="mt-1 ml-2 list-inside list-disc">
                    <li>{scan.issues.length} issues</li>
                    <li>WCAG criteria and recommendations</li>
                    <li>Element selectors and context</li>
                    {checklist && <li>Manual checklist results</li>}
                </ul>
            </div>
        </div>
    );
}
