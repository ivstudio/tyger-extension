import type { ScanResult, ScanDiff } from '@/types/issue';
import { mockIssues } from './issues';

export function createMockScanResult(
    overrides?: Partial<ScanResult>
): ScanResult {
    const issues = overrides?.issues || mockIssues;

    return {
        url: 'https://example.com',
        timestamp: Date.now(),
        issues,
        summary: {
            total: issues.length,
            bySeverity: {
                critical: issues.filter(i => i.impact === 'critical').length,
                serious: issues.filter(i => i.impact === 'serious').length,
                moderate: issues.filter(i => i.impact === 'moderate').length,
                minor: issues.filter(i => i.impact === 'minor').length,
            },
            byWCAG: {
                A: issues.filter(i => i.wcag.level === 'A').length,
                AA: issues.filter(i => i.wcag.level === 'AA').length,
                AAA: issues.filter(i => i.wcag.level === 'AAA').length,
            },
        },
        scanConfig: {
            axeVersion: '4.7.0',
            rules: ['wcag2a', 'wcag2aa'],
        },
        ...overrides,
    };
}

export function createMockScanDiff(overrides?: Partial<ScanDiff>): ScanDiff {
    return {
        newIssues: [],
        resolvedIssues: [],
        existingIssues: mockIssues,
        summary: {
            new: 0,
            resolved: 0,
            existing: mockIssues.length,
        },
        ...overrides,
    };
}

export const mockEmptyScanResult = createMockScanResult({
    issues: [],
    summary: {
        total: 0,
        bySeverity: { critical: 0, serious: 0, moderate: 0, minor: 0 },
        byWCAG: { A: 0, AA: 0, AAA: 0 },
    },
});
