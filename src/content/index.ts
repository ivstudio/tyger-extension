import { runScan } from '@/lib/scanner';
import { onMessage, sendMessage } from '@/lib/messaging';
import { MessageType, ScanRequestMessage } from '@/types/messages';
import { ScanResult } from '@/types/issue';
import { highlightIssue, clearAllHighlights } from './overlay';
import { enablePicker, disablePicker } from './picker';

console.log('Accessibility Audit content script loaded');

// Track scan state
let isScanning = false;
let currentScanResult: ScanResult | null = null;

// Listen for scan requests from side panel
onMessage(async (message) => {
  console.log('Content script received message:', message.type);

  switch (message.type) {
    case MessageType.SCAN_REQUEST:
      await handleScanRequest(message as ScanRequestMessage);
      break;

    case MessageType.HIGHLIGHT_ISSUE:
      handleHighlightIssue(message.data.issueId);
      break;

    case MessageType.CLEAR_HIGHLIGHTS:
      clearAllHighlights();
      console.log('All highlights cleared');
      break;

    case MessageType.TOGGLE_PICKER:
      if (message.data.enabled) {
        enablePicker();
      } else {
        disablePicker();
      }
      break;

    default:
      // Ignore messages not meant for content script
      break;
  }
});

// Listen for messages from the page (from overlay clicks and picker)
window.addEventListener('message', (event) => {
  // Only accept messages from same origin
  if (event.source !== window) return;

  if (event.data.type === 'HIGHLIGHT_CLICKED') {
    // Forward to side panel
    sendMessage({
      type: MessageType.INSPECT_ELEMENT,
      data: {
        selector: '', // Will be filled by issue lookup
        elementInfo: { issueId: event.data.issueId }
      }
    });
  } else if (event.data.type === 'ELEMENT_PICKED') {
    // Forward element info to side panel
    sendMessage({
      type: MessageType.INSPECT_ELEMENT,
      data: {
        selector: event.data.elementInfo.selector,
        elementInfo: event.data.elementInfo
      }
    });
  }
});

/**
 * Handle scan request
 */
async function handleScanRequest(message: ScanRequestMessage): Promise<void> {
  if (isScanning) {
    console.warn('Scan already in progress');
    return;
  }

  isScanning = true;

  // Clear existing highlights when starting new scan
  clearAllHighlights();

  try {
    console.log('Starting accessibility scan...');
    const result: ScanResult = await runScan();

    console.log('Scan complete:', result.summary);

    // Store result for highlighting
    currentScanResult = result;

    // Optionally highlight all issues automatically
    // highlightAllIssues(result.issues);

    // Send results back to side panel
    await sendMessage({
      type: MessageType.SCAN_COMPLETE,
      data: {
        result,
        runId: message.data.runId
      }
    });
  } catch (error) {
    console.error('Scan failed:', error);

    // Send error back to side panel
    await sendMessage({
      type: MessageType.SCAN_ERROR,
      data: {
        error: error instanceof Error ? error.message : 'Unknown scan error',
        runId: message.data.runId
      }
    });
  } finally {
    isScanning = false;
  }
}

/**
 * Handle highlight issue request
 */
function handleHighlightIssue(issueId: string): void {
  if (!currentScanResult) {
    console.warn('No scan results available');
    return;
  }

  const issue = currentScanResult.issues.find(i => i.id === issueId);
  if (!issue) {
    console.warn('Issue not found:', issueId);
    return;
  }

  highlightIssue(issue);
  console.log('Highlighted issue:', issueId);
}
