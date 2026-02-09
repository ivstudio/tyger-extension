import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    mockChrome,
    getChromeStorageData,
    resetChromeMocks,
} from '@/test/mocks/chrome';
import { createMockScanResult, createMockIssue } from '@/test/fixtures';
import { createMockManualChecklist } from '@/test/fixtures/checklists';
import * as storage from './storage';

// Mock webextension-polyfill to use our Chrome mocks
vi.mock('webextension-polyfill', () => ({
    default: mockChrome,
}));

describe('storage', () => {
    beforeEach(() => {
        resetChromeMocks();
    });

    describe('saveScanResult', () => {
        it('should save scan result to storage', async () => {
            const scanResult = createMockScanResult({
                url: 'https://example.com',
            });

            await storage.saveScanResult(scanResult);

            const data = getChromeStorageData();
            expect(data.scan_results).toBeDefined();
            expect(
                (data.scan_results as any)['https://example.com']
            ).toHaveLength(1);
            expect(
                (data.scan_results as any)['https://example.com'][0]
            ).toEqual(scanResult);
        });

        it('should add new scan at the beginning of array', async () => {
            const scan1 = createMockScanResult({
                url: 'https://example.com',
                timestamp: 1000,
            });
            const scan2 = createMockScanResult({
                url: 'https://example.com',
                timestamp: 2000,
            });

            await storage.saveScanResult(scan1);
            await storage.saveScanResult(scan2);

            const results = await storage.getScanResultsForUrl(
                'https://example.com'
            );
            expect(results[0].timestamp).toBe(2000); // Most recent first
            expect(results[1].timestamp).toBe(1000);
        });

        it('should auto-prune to keep only last 10 scans per URL', async () => {
            const url = 'https://example.com';

            // Add 12 scans
            for (let i = 0; i < 12; i++) {
                const scan = createMockScanResult({ url, timestamp: i });
                await storage.saveScanResult(scan);
            }

            const results = await storage.getScanResultsForUrl(url);
            expect(results).toHaveLength(10);

            // Should keep most recent 10 (timestamps 11 down to 2)
            expect(results[0].timestamp).toBe(11);
            expect(results[9].timestamp).toBe(2);
        });

        it('should keep scans separate by URL', async () => {
            const scan1 = createMockScanResult({ url: 'https://example.com' });
            const scan2 = createMockScanResult({ url: 'https://test.com' });

            await storage.saveScanResult(scan1);
            await storage.saveScanResult(scan2);

            const results1 = await storage.getScanResultsForUrl(
                'https://example.com'
            );
            const results2 =
                await storage.getScanResultsForUrl('https://test.com');

            expect(results1).toHaveLength(1);
            expect(results2).toHaveLength(1);
            expect(results1[0].url).toBe('https://example.com');
            expect(results2[0].url).toBe('https://test.com');
        });
    });

    describe('getScanResults', () => {
        it('should return empty object when no results stored', async () => {
            const results = await storage.getScanResults();
            expect(results).toEqual({});
        });

        it('should return all scan results', async () => {
            const scan1 = createMockScanResult({ url: 'https://example.com' });
            const scan2 = createMockScanResult({ url: 'https://test.com' });

            await storage.saveScanResult(scan1);
            await storage.saveScanResult(scan2);

            const results = await storage.getScanResults();
            expect(Object.keys(results)).toHaveLength(2);
            expect(results['https://example.com']).toBeDefined();
            expect(results['https://test.com']).toBeDefined();
        });
    });

    describe('getScanResultsForUrl', () => {
        it('should return empty array when URL has no scans', async () => {
            const results = await storage.getScanResultsForUrl(
                'https://nonexistent.com'
            );
            expect(results).toEqual([]);
        });

        it('should return scans for specific URL', async () => {
            const url = 'https://example.com';
            const scan1 = createMockScanResult({ url, timestamp: 1000 });
            const scan2 = createMockScanResult({ url, timestamp: 2000 });

            await storage.saveScanResult(scan1);
            await storage.saveScanResult(scan2);

            const results = await storage.getScanResultsForUrl(url);
            expect(results).toHaveLength(2);
        });
    });

    describe('getLatestScanResult', () => {
        it('should return null when no scans exist', async () => {
            const result = await storage.getLatestScanResult(
                'https://example.com'
            );
            expect(result).toBeNull();
        });

        it('should return most recent scan', async () => {
            const url = 'https://example.com';
            const scan1 = createMockScanResult({ url, timestamp: 1000 });
            const scan2 = createMockScanResult({ url, timestamp: 2000 });
            const scan3 = createMockScanResult({ url, timestamp: 3000 });

            await storage.saveScanResult(scan1);
            await storage.saveScanResult(scan2);
            await storage.saveScanResult(scan3);

            const latest = await storage.getLatestScanResult(url);
            expect(latest?.timestamp).toBe(3000);
        });
    });

    describe('compareScanResults', () => {
        it('should identify new issues', () => {
            const issue1 = createMockIssue({
                ruleId: 'color-contrast',
                node: { selector: '.btn', snippet: '', xpath: '' },
            });
            const issue2 = createMockIssue({
                ruleId: 'image-alt',
                node: { selector: 'img', snippet: '', xpath: '' },
            });

            const previous = createMockScanResult({ issues: [issue1] });
            const current = createMockScanResult({ issues: [issue1, issue2] });

            const diff = storage.compareScanResults(previous, current);

            expect(diff.newIssues).toHaveLength(1);
            expect(diff.newIssues[0].ruleId).toBe('image-alt');
            expect(diff.summary.new).toBe(1);
        });

        it('should identify resolved issues', () => {
            const issue1 = createMockIssue({
                ruleId: 'color-contrast',
                node: { selector: '.btn', snippet: '', xpath: '' },
            });
            const issue2 = createMockIssue({
                ruleId: 'image-alt',
                node: { selector: 'img', snippet: '', xpath: '' },
            });

            const previous = createMockScanResult({ issues: [issue1, issue2] });
            const current = createMockScanResult({ issues: [issue1] });

            const diff = storage.compareScanResults(previous, current);

            expect(diff.resolvedIssues).toHaveLength(1);
            expect(diff.resolvedIssues[0].ruleId).toBe('image-alt');
            expect(diff.summary.resolved).toBe(1);
        });

        it('should identify existing issues', () => {
            const issue1 = createMockIssue({
                ruleId: 'color-contrast',
                node: { selector: '.btn', snippet: '', xpath: '' },
            });
            const issue2 = createMockIssue({
                ruleId: 'image-alt',
                node: { selector: 'img', snippet: '', xpath: '' },
            });

            const previous = createMockScanResult({ issues: [issue1, issue2] });
            const current = createMockScanResult({ issues: [issue1, issue2] });

            const diff = storage.compareScanResults(previous, current);

            expect(diff.existingIssues).toHaveLength(2);
            expect(diff.newIssues).toHaveLength(0);
            expect(diff.resolvedIssues).toHaveLength(0);
            expect(diff.summary.existing).toBe(2);
        });

        it('should handle completely different scans', () => {
            const issue1 = createMockIssue({
                ruleId: 'color-contrast',
                node: { selector: '.btn', snippet: '', xpath: '' },
            });
            const issue2 = createMockIssue({
                ruleId: 'image-alt',
                node: { selector: 'img', snippet: '', xpath: '' },
            });

            const previous = createMockScanResult({ issues: [issue1] });
            const current = createMockScanResult({ issues: [issue2] });

            const diff = storage.compareScanResults(previous, current);

            expect(diff.newIssues).toHaveLength(1);
            expect(diff.resolvedIssues).toHaveLength(1);
            expect(diff.existingIssues).toHaveLength(0);
        });

        it('should use ruleId + selector as unique identifier', () => {
            // Same rule, different selectors = different issues
            const issue1 = createMockIssue({
                ruleId: 'color-contrast',
                node: { selector: '.btn-1', snippet: '', xpath: '' },
            });
            const issue2 = createMockIssue({
                ruleId: 'color-contrast',
                node: { selector: '.btn-2', snippet: '', xpath: '' },
            });

            const previous = createMockScanResult({ issues: [issue1] });
            const current = createMockScanResult({ issues: [issue2] });

            const diff = storage.compareScanResults(previous, current);

            expect(diff.newIssues).toHaveLength(1);
            expect(diff.resolvedIssues).toHaveLength(1);
        });
    });

    describe('checklist storage', () => {
        it('should save checklist', async () => {
            const checklist = createMockManualChecklist({
                url: 'https://example.com',
            });

            await storage.saveChecklist(checklist);

            const data = getChromeStorageData();
            expect(data.manual_checklists).toBeDefined();
            expect(
                (data.manual_checklists as any)['https://example.com']
            ).toHaveLength(1);
        });

        it('should auto-prune checklists to max 10 per URL', async () => {
            const url = 'https://example.com';

            for (let i = 0; i < 12; i++) {
                const checklist = createMockManualChecklist({
                    url,
                    timestamp: i,
                });
                await storage.saveChecklist(checklist);
            }

            const checklists = await storage.getChecklists();
            expect(checklists[url]).toHaveLength(10);
        });

        it('should get latest checklist for URL', async () => {
            const url = 'https://example.com';
            const checklist1 = createMockManualChecklist({
                url,
                timestamp: 1000,
            });
            const checklist2 = createMockManualChecklist({
                url,
                timestamp: 2000,
            });

            await storage.saveChecklist(checklist1);
            await storage.saveChecklist(checklist2);

            const latest = await storage.getLatestChecklist(url);
            expect(latest?.timestamp).toBe(2000);
        });

        it('should return null when no checklists exist', async () => {
            const latest = await storage.getLatestChecklist(
                'https://nonexistent.com'
            );
            expect(latest).toBeNull();
        });
    });

    describe('settings', () => {
        it('should return default settings when none exist', async () => {
            const settings = await storage.getSettings();
            expect(settings).toEqual({
                analyticsEnabled: false,
                firstRunComplete: false,
            });
        });

        it('should update settings', async () => {
            await storage.updateSettings({ analyticsEnabled: true });

            const settings = await storage.getSettings();
            expect(settings.analyticsEnabled).toBe(true);
            expect(settings.firstRunComplete).toBe(false); // Should keep default
        });

        it('should merge settings updates', async () => {
            await storage.updateSettings({ analyticsEnabled: true });
            await storage.updateSettings({ firstRunComplete: true });

            const settings = await storage.getSettings();
            expect(settings.analyticsEnabled).toBe(true);
            expect(settings.firstRunComplete).toBe(true);
        });
    });

    describe('clearAllData', () => {
        it('should clear all storage', async () => {
            const scan = createMockScanResult({ url: 'https://example.com' });
            const checklist = createMockManualChecklist({
                url: 'https://example.com',
            });

            await storage.saveScanResult(scan);
            await storage.saveChecklist(checklist);
            await storage.updateSettings({ analyticsEnabled: true });

            await storage.clearAllData();

            const data = getChromeStorageData();
            expect(Object.keys(data)).toHaveLength(0);
        });
    });

    describe('clearDataForUrl', () => {
        it('should clear data for specific URL only', async () => {
            const scan1 = createMockScanResult({ url: 'https://example.com' });
            const scan2 = createMockScanResult({ url: 'https://test.com' });

            await storage.saveScanResult(scan1);
            await storage.saveScanResult(scan2);

            await storage.clearDataForUrl('https://example.com');

            const results = await storage.getScanResults();
            expect(results['https://example.com']).toBeUndefined();
            expect(results['https://test.com']).toBeDefined();
        });

        it('should clear both scans and checklists for URL', async () => {
            const url = 'https://example.com';
            const scan = createMockScanResult({ url });
            const checklist = createMockManualChecklist({ url });

            await storage.saveScanResult(scan);
            await storage.saveChecklist(checklist);

            await storage.clearDataForUrl(url);

            const scans = await storage.getScanResultsForUrl(url);
            const latest = await storage.getLatestChecklist(url);

            expect(scans).toHaveLength(0);
            expect(latest).toBeNull();
        });
    });

    describe('updateIssueStatus', () => {
        it('should update issue status in latest scan', async () => {
            const issue = createMockIssue({ id: 'issue-123', status: 'open' });
            const scan = createMockScanResult({
                url: 'https://example.com',
                issues: [issue],
            });

            await storage.saveScanResult(scan);
            await storage.updateIssueStatus(
                'https://example.com',
                'issue-123',
                'fixed',
                'Fixed by PR #123'
            );

            const latest = await storage.getLatestScanResult(
                'https://example.com'
            );
            const updatedIssue = latest?.issues.find(i => i.id === 'issue-123');

            expect(updatedIssue?.status).toBe('fixed');
            expect(updatedIssue?.notes).toBe('Fixed by PR #123');
        });

        it('should do nothing if URL has no scans', async () => {
            await expect(
                storage.updateIssueStatus(
                    'https://nonexistent.com',
                    'issue-123',
                    'fixed'
                )
            ).resolves.not.toThrow();
        });

        it('should do nothing if issue ID not found', async () => {
            const issue = createMockIssue({ id: 'issue-123' });
            const scan = createMockScanResult({
                url: 'https://example.com',
                issues: [issue],
            });

            await storage.saveScanResult(scan);
            await storage.updateIssueStatus(
                'https://example.com',
                'nonexistent',
                'fixed'
            );

            const latest = await storage.getLatestScanResult(
                'https://example.com'
            );
            expect(latest?.issues[0].status).toBe('open'); // Unchanged
        });

        it('should update status without notes if not provided', async () => {
            const issue = createMockIssue({ id: 'issue-123', status: 'open' });
            const scan = createMockScanResult({
                url: 'https://example.com',
                issues: [issue],
            });

            await storage.saveScanResult(scan);
            await storage.updateIssueStatus(
                'https://example.com',
                'issue-123',
                'ignored'
            );

            const latest = await storage.getLatestScanResult(
                'https://example.com'
            );
            const updatedIssue = latest?.issues.find(i => i.id === 'issue-123');

            expect(updatedIssue?.status).toBe('ignored');
        });
    });

    describe('checkStorageUsage (via saveScanResult)', () => {
        it('should not throw when getBytesInUse is not supported', async () => {
            const scan = createMockScanResult({ url: 'https://example.com' });
            const originalGetBytesInUse =
                mockChrome.storage.local.getBytesInUse;
            (mockChrome.storage.local as any).getBytesInUse = undefined;

            await expect(storage.saveScanResult(scan)).resolves.not.toThrow();

            (mockChrome.storage.local as any).getBytesInUse =
                originalGetBytesInUse;
        });

        it('should warn when storage usage exceeds 80%', async () => {
            const scan = createMockScanResult({ url: 'https://example.com' });
            const warnSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});
            const originalGetBytesInUse =
                mockChrome.storage.local.getBytesInUse;
            (mockChrome.storage.local as any).getBytesInUse = vi.fn(() =>
                Promise.resolve(9 * 1024 * 1024)
            );

            await storage.saveScanResult(scan);

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Storage usage is at')
            );

            warnSpy.mockRestore();
            (mockChrome.storage.local as any).getBytesInUse =
                originalGetBytesInUse;
        });
    });
});
