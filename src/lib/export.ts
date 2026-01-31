import { ScanResult } from '@/types/issue';
import { ManualChecklist } from '@/types/checklist';

const EXPORT_VERSION = '1.0.0';

export interface ExportData {
  version: string;
  exportDate: string;
  scan: ScanResult;
  checklist?: ManualChecklist;
  metadata: {
    extensionVersion: string;
    browser: string;
  };
}

/**
 * Export scan results as JSON
 */
export function exportAsJSON(
  scan: ScanResult,
  checklist?: ManualChecklist
): string {
  const data: ExportData = {
    version: EXPORT_VERSION,
    exportDate: new Date().toISOString(),
    scan,
    checklist,
    metadata: {
      extensionVersion: chrome.runtime.getManifest().version,
      browser: navigator.userAgent
    }
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Download JSON file
 */
export function downloadJSON(
  scan: ScanResult,
  checklist?: ManualChecklist
): void {
  const json = exportAsJSON(scan, checklist);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const hostname = new URL(scan.url).hostname;
  const timestamp = new Date(scan.timestamp).toISOString().split('T')[0];
  const filename = `accessibility-audit-${hostname}-${timestamp}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Copy JSON to clipboard
 */
export async function copyToClipboard(
  scan: ScanResult,
  checklist?: ManualChecklist
): Promise<void> {
  const json = exportAsJSON(scan, checklist);
  await navigator.clipboard.writeText(json);
}

/**
 * Get estimated file size
 */
export function getEstimatedSize(
  scan: ScanResult,
  checklist?: ManualChecklist
): string {
  const json = exportAsJSON(scan, checklist);
  const bytes = new Blob([json]).size;

  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
