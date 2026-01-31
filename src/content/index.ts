import { runScan } from '@/lib/scanner';
import { onMessage, sendMessage } from '@/lib/messaging';
import { MessageType, ScanRequestMessage } from '@/types/messages';
import { ScanResult } from '@/types/issue';

console.log('Accessibility Audit content script loaded');

// Track scan state
let isScanning = false;

// Listen for scan requests from side panel
onMessage(async (message) => {
  console.log('Content script received message:', message.type);

  switch (message.type) {
    case MessageType.SCAN_REQUEST:
      await handleScanRequest(message as ScanRequestMessage);
      break;

    case MessageType.HIGHLIGHT_ISSUE:
      // TODO: Implement highlighting
      console.log('Highlight issue:', message.data.issueId);
      break;

    case MessageType.CLEAR_HIGHLIGHTS:
      // TODO: Implement highlight clearing
      console.log('Clear highlights');
      break;

    case MessageType.TOGGLE_PICKER:
      // TODO: Implement element picker
      console.log('Toggle picker:', message.data.enabled);
      break;

    default:
      // Ignore messages not meant for content script
      break;
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

  try {
    console.log('Starting accessibility scan...');
    const result: ScanResult = await runScan();

    console.log('Scan complete:', result.summary);

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
