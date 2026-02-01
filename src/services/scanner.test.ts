import { describe, it, expect, vi, beforeEach } from 'vitest';
import axe, { type AxeResults, type Result } from 'axe-core';
import * as scanner from './scanner';

// Mock axe-core
vi.mock('axe-core', () => ({
    default: {
        run: vi.fn() as any,
        configure: vi.fn(),
    },
}));

// Mock dom-accessibility-api
vi.mock('dom-accessibility-api', () => ({
    computeAccessibleName: vi.fn(
        (el: HTMLElement) =>
            el.getAttribute('aria-label') || el.textContent || ''
    ),
}));

describe('scanner', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup minimal DOM
        document.body.innerHTML = `
      <div id="test-container">
        <button class="btn-primary">Submit</button>
        <img src="test.jpg" />
      </div>
    `;
    });

    describe('configureAxe', () => {
        it('should configure axe with branding', () => {
            scanner.configureAxe();

            expect(axe.configure).toHaveBeenCalledWith({
                branding: {
                    application: 'Accessibility Audit Extension',
                },
                rules: [],
            });
        });
    });

    describe('runScan', () => {
        const mockAxeViolation: Result = {
            id: 'color-contrast',
            impact: 'serious',
            tags: ['wcag2aa', 'wcag143'],
            description:
                'Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds',
            help: 'Elements must have sufficient color contrast',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/color-contrast',
            nodes: [
                {
                    any: [],
                    all: [],
                    none: [],
                    impact: 'serious',
                    html: '<button class="btn-primary">Submit</button>',
                    target: ['.btn-primary'],
                    failureSummary:
                        'Fix any of the following:\n  Element has insufficient color contrast of 2.1:1',
                } as any,
            ],
        } as Result;

        const mockAxeIncomplete: Result = {
            id: 'image-alt',
            impact: 'critical',
            tags: ['wcag2a', 'wcag111'],
            description:
                'Ensures img elements have alternate text or a role of none or presentation',
            help: 'Images must have alternate text',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/image-alt',
            nodes: [
                {
                    any: [],
                    all: [],
                    none: [],
                    impact: 'critical',
                    html: '<img src="test.jpg" />',
                    target: ['img'],
                    failureSummary:
                        'Fix any of the following:\n  Element does not have an alt attribute',
                } as any,
            ],
        } as Result;

        const mockAxeResults: AxeResults = {
            violations: [mockAxeViolation],
            incomplete: [mockAxeIncomplete],
            passes: [],
            inapplicable: [],
            timestamp: new Date().toISOString(),
            url: 'https://example.com',
            testEngine: {
                name: 'axe-core',
                version: '4.8.3',
            },
            testRunner: {
                name: 'axe',
            },
            testEnvironment: {} as any,
            toolOptions: {} as any,
        };

        beforeEach(() => {
            vi.mocked(axe.run).mockResolvedValue(mockAxeResults as any);

            // Mock window.location
            Object.defineProperty(window, 'location', {
                value: {
                    href: 'https://example.com/test',
                },
                writable: true,
            });
        });

        it('should run scan and return ScanResult', async () => {
            const result = await scanner.runScan();

            expect(axe.configure).toHaveBeenCalled();
            expect(axe.run).toHaveBeenCalledWith(document, {
                runOnly: {
                    type: 'tag',
                    values: [
                        'wcag2a',
                        'wcag2aa',
                        'wcag2aaa',
                        'wcag21a',
                        'wcag21aa',
                        'wcag22aa',
                        'best-practice',
                    ],
                },
                resultTypes: ['violations', 'incomplete'],
                iframes: true,
            });

            expect(result).toMatchObject({
                url: 'https://example.com/test',
                timestamp: expect.any(Number),
                issues: expect.any(Array),
                summary: expect.any(Object),
                scanConfig: {
                    axeVersion: '4.8.3',
                    rules: ['color-contrast'],
                },
            });
        });

        it('should process violations correctly', async () => {
            const result = await scanner.runScan();

            // Should have 2 issues (1 violation + 1 incomplete)
            expect(result.issues).toHaveLength(2);

            // Check violation issue
            const violation = result.issues.find(
                i => i.ruleId === 'color-contrast'
            );
            expect(violation).toBeDefined();
            expect(violation).toMatchObject({
                id: expect.any(String),
                source: 'axe',
                ruleId: 'color-contrast',
                title: 'Elements must have sufficient color contrast',
                impact: 'serious',
                confidence: 'high',
                wcag: {
                    level: 'AA',
                    criteria: ['143'],
                },
                node: {
                    selector: '.btn-primary',
                    snippet: '<button class="btn-primary">Submit</button>',
                },
                status: 'open',
                tags: ['wcag2aa', 'wcag143'],
                timestamp: expect.any(Number),
            });
        });

        it('should process incomplete checks correctly', async () => {
            const result = await scanner.runScan();

            // Check incomplete issue
            const incomplete = result.issues.find(
                i => i.ruleId === 'image-alt'
            );
            expect(incomplete).toBeDefined();
            expect(incomplete).toMatchObject({
                ruleId: 'image-alt',
                confidence: 'medium',
                wcag: {
                    level: 'A',
                    criteria: ['111'],
                },
                notes: 'This issue requires manual verification',
            });
        });

        it('should calculate summary correctly', async () => {
            const result = await scanner.runScan();

            expect(result.summary).toEqual({
                total: 2,
                bySeverity: {
                    critical: 1, // image-alt
                    serious: 1, // color-contrast
                    moderate: 0,
                    minor: 0,
                },
                byWCAG: {
                    A: 1, // image-alt (wcag2a)
                    AA: 1, // color-contrast (wcag2aa)
                    AAA: 0,
                },
            });
        });

        it('should include recommendations for each issue', async () => {
            const result = await scanner.runScan();

            const violation = result.issues[0];
            expect(violation.recommendations).toBeDefined();
            expect(violation.recommendations.length).toBeGreaterThan(0);

            // Should have developer recommendation
            const devRec = violation.recommendations.find(
                r => r.role === 'developer'
            );
            expect(devRec).toBeDefined();
            expect(devRec).toMatchObject({
                role: 'developer',
                title: expect.any(String),
                description: expect.any(String),
                priority: expect.stringMatching(/^(high|medium|low)$/),
            });

            // Should have QA recommendation
            const qaRec = violation.recommendations.find(r => r.role === 'qa');
            expect(qaRec).toBeDefined();
        });

        it('should handle errors gracefully', async () => {
            const error = new Error('Axe scan failed');
            vi.mocked(axe.run).mockRejectedValueOnce(error);

            await expect(scanner.runScan()).rejects.toThrow(
                'Accessibility scan failed: Axe scan failed'
            );
        });

        it('should handle non-Error rejections', async () => {
            vi.mocked(axe.run).mockRejectedValueOnce('String error');

            await expect(scanner.runScan()).rejects.toThrow(
                'Accessibility scan failed: Unknown error'
            );
        });

        it('should handle empty results', async () => {
            const emptyResults: AxeResults = {
                ...mockAxeResults,
                violations: [],
                incomplete: [],
            };
            vi.mocked(axe.run).mockResolvedValueOnce(emptyResults as any);

            const result = await scanner.runScan();

            expect(result.issues).toHaveLength(0);
            expect(result.summary).toEqual({
                total: 0,
                bySeverity: {
                    critical: 0,
                    serious: 0,
                    moderate: 0,
                    minor: 0,
                },
                byWCAG: {
                    A: 0,
                    AA: 0,
                    AAA: 0,
                },
            });
        });

        it('should handle missing impact level', async () => {
            const violationWithoutImpact: Result = {
                ...mockAxeViolation,
                impact: undefined as any,
            };

            const resultsWithoutImpact: AxeResults = {
                ...mockAxeResults,
                violations: [violationWithoutImpact],
                incomplete: [],
            };

            vi.mocked(axe.run).mockResolvedValueOnce(
                resultsWithoutImpact as any
            );

            const result = await scanner.runScan();

            expect(result.issues[0].impact).toBe('moderate'); // default fallback
        });

        it('should handle AAA WCAG tags', async () => {
            const aaaViolation: Result = {
                ...mockAxeViolation,
                tags: ['wcag2aaa', 'wcag146'],
            };

            const aaaResults: AxeResults = {
                ...mockAxeResults,
                violations: [aaaViolation],
                incomplete: [],
            };

            vi.mocked(axe.run).mockResolvedValueOnce(aaaResults as any);

            const result = await scanner.runScan();

            expect(result.issues[0].wcag.level).toBe('AAA');
            expect(result.summary.byWCAG.AAA).toBe(1);
        });

        it('should handle design-related issues with designer recommendations', async () => {
            const result = await scanner.runScan();

            // color-contrast is design-related
            const colorContrastIssue = result.issues.find(
                i => i.ruleId === 'color-contrast'
            );
            const designerRec = colorContrastIssue?.recommendations.find(
                r => r.role === 'designer'
            );

            expect(designerRec).toBeDefined();
            expect(designerRec?.description).toContain('contrast ratio');
        });

        it('should handle array selectors', async () => {
            const violationWithArraySelector: Result = {
                ...mockAxeViolation,
                nodes: [
                    {
                        ...mockAxeViolation.nodes[0],
                        target: [['html', 'body', '.btn-primary']],
                    } as any,
                ],
            };

            const results: AxeResults = {
                ...mockAxeResults,
                violations: [violationWithArraySelector],
                incomplete: [],
            };

            vi.mocked(axe.run).mockResolvedValueOnce(results as any);

            const result = await scanner.runScan();

            expect(result.issues[0].node.selector).toBe(
                'html body .btn-primary'
            );
        });
    });
});
