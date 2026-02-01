import browser from 'webextension-polyfill';
import { ScanResult, ScanDiff, Issue } from '@/types/issue';
import { ManualChecklist } from '@/types/checklist';

const STORAGE_KEYS = {
  SCAN_RESULTS: 'scan_results',
  CHECKLISTS: 'manual_checklists',
  SETTINGS: 'settings'
} as const;

const MAX_SCANS_PER_URL = 10;
const MAX_STORAGE_BYTES = 10 * 1024 * 1024; // 10MB Chrome storage limit

export interface StoredScans {
  [url: string]: ScanResult[];
}

export interface StoredChecklists {
  [url: string]: ManualChecklist[];
}

export interface Settings {
  analyticsEnabled: boolean;
  firstRunComplete: boolean;
}

/**
 * Save scan result for a URL (with auto-pruning)
 */
export async function saveScanResult(result: ScanResult): Promise<void> {
  const stored = await getScanResults();
  const urlScans = stored[result.url] || [];

  // Add new scan at the beginning
  urlScans.unshift(result);

  // Keep only last MAX_SCANS_PER_URL scans
  if (urlScans.length > MAX_SCANS_PER_URL) {
    urlScans.splice(MAX_SCANS_PER_URL);
  }

  stored[result.url] = urlScans;

  await browser.storage.local.set({
    [STORAGE_KEYS.SCAN_RESULTS]: stored
  });

  // Check storage usage
  await checkStorageUsage();
}

/**
 * Get all scan results
 */
export async function getScanResults(): Promise<StoredScans> {
  const result = await browser.storage.local.get(STORAGE_KEYS.SCAN_RESULTS);
  return (result[STORAGE_KEYS.SCAN_RESULTS] || {}) as StoredScans;
}

/**
 * Get scan results for specific URL
 */
export async function getScanResultsForUrl(url: string): Promise<ScanResult[]> {
  const stored = await getScanResults();
  return stored[url] || [];
}

/**
 * Get latest scan result for URL
 */
export async function getLatestScanResult(url: string): Promise<ScanResult | null> {
  const scans = await getScanResultsForUrl(url);
  return scans.length > 0 ? scans[0] : null;
}

/**
 * Compare two scan results and return diff
 */
export function compareScanResults(
  previous: ScanResult,
  current: ScanResult
): ScanDiff {
  const previousIssueIds = new Set(previous.issues.map(i => i.ruleId + i.node.selector));
  const currentIssueIds = new Set(current.issues.map(i => i.ruleId + i.node.selector));

  const newIssues: Issue[] = [];
  const existingIssues: Issue[] = [];
  const resolvedIssues: Issue[] = [];

  // Find new and existing issues
  for (const issue of current.issues) {
    const issueId = issue.ruleId + issue.node.selector;
    if (previousIssueIds.has(issueId)) {
      existingIssues.push(issue);
    } else {
      newIssues.push(issue);
    }
  }

  // Find resolved issues
  for (const issue of previous.issues) {
    const issueId = issue.ruleId + issue.node.selector;
    if (!currentIssueIds.has(issueId)) {
      resolvedIssues.push(issue);
    }
  }

  return {
    newIssues,
    resolvedIssues,
    existingIssues,
    summary: {
      new: newIssues.length,
      resolved: resolvedIssues.length,
      existing: existingIssues.length
    }
  };
}

/**
 * Save manual checklist
 */
export async function saveChecklist(checklist: ManualChecklist): Promise<void> {
  const stored = await getChecklists();
  const urlChecklists = stored[checklist.url] || [];

  // Add new checklist at the beginning
  urlChecklists.unshift(checklist);

  // Keep only last MAX_SCANS_PER_URL checklists
  if (urlChecklists.length > MAX_SCANS_PER_URL) {
    urlChecklists.splice(MAX_SCANS_PER_URL);
  }

  stored[checklist.url] = urlChecklists;

  await browser.storage.local.set({
    [STORAGE_KEYS.CHECKLISTS]: stored
  });
}

/**
 * Get all checklists
 */
export async function getChecklists(): Promise<StoredChecklists> {
  const result = await browser.storage.local.get(STORAGE_KEYS.CHECKLISTS);
  return (result[STORAGE_KEYS.CHECKLISTS] || {}) as StoredChecklists;
}

/**
 * Get latest checklist for URL
 */
export async function getLatestChecklist(url: string): Promise<ManualChecklist | null> {
  const stored = await getChecklists();
  const urlChecklists = stored[url] || [];
  return urlChecklists.length > 0 ? urlChecklists[0] : null;
}

/**
 * Get or create settings
 */
export async function getSettings(): Promise<Settings> {
  const result = await browser.storage.local.get(STORAGE_KEYS.SETTINGS);
  return (result[STORAGE_KEYS.SETTINGS] || {
    analyticsEnabled: false,
    firstRunComplete: false
  }) as Settings;
}

/**
 * Update settings
 */
export async function updateSettings(settings: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  await browser.storage.local.set({
    [STORAGE_KEYS.SETTINGS]: { ...current, ...settings }
  });
}

/**
 * Clear all stored data
 */
export async function clearAllData(): Promise<void> {
  await browser.storage.local.clear();
}

/**
 * Clear data for specific URL
 */
export async function clearDataForUrl(url: string): Promise<void> {
  const scans = await getScanResults();
  const checklists = await getChecklists();

  delete scans[url];
  delete checklists[url];

  await browser.storage.local.set({
    [STORAGE_KEYS.SCAN_RESULTS]: scans,
    [STORAGE_KEYS.CHECKLISTS]: checklists
  });
}

/**
 * Check storage usage and warn if approaching limit
 */
async function checkStorageUsage(): Promise<void> {
  if (!(browser.storage.local as any).getBytesInUse) {
    return; // Not supported in all browsers
  }

  const bytesInUse = await (browser.storage.local as any).getBytesInUse();
  const percentUsed = (bytesInUse / MAX_STORAGE_BYTES) * 100;

  if (percentUsed > 80) {
    console.warn(
      `Storage usage is at ${percentUsed.toFixed(1)}% (${bytesInUse} / ${MAX_STORAGE_BYTES} bytes). ` +
      'Consider clearing old scan results.'
    );
  }
}

/**
 * Update issue status in stored scan results
 */
export async function updateIssueStatus(
  url: string,
  issueId: string,
  status: Issue['status'],
  notes?: string
): Promise<void> {
  const scans = await getScanResultsForUrl(url);

  if (scans.length === 0) {
    return;
  }

  // Update the issue in the latest scan
  const latestScan = scans[0];
  const issue = latestScan.issues.find(i => i.id === issueId);

  if (issue) {
    issue.status = status;
    if (notes !== undefined) {
      issue.notes = notes;
    }

    // Save updated scan
    await saveScanResult(latestScan);
  }
}
