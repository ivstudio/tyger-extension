import axe, { AxeResults, Result } from 'axe-core';
import { computeAccessibleName } from 'dom-accessibility-api';
import { Issue, ScanResult, ImpactLevel, Recommendation } from '@/types/issue';

// Simple ID generator
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Configure axe-core with custom rules
 */
export function configureAxe(): void {
    // Configure axe to run all rules
    axe.configure({
        branding: {
            application: 'Accessibility Audit Extension',
        },
        // Run all rules by default
        rules: [],
    });
}

/**
 * Run axe-core scan on current page
 */
export async function runScan(): Promise<ScanResult> {
    try {
        configureAxe();

        const results: AxeResults = await axe.run(document, {
            // Run on entire document
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
            // Include all frames
            iframes: true,
        });

        const issues: Issue[] = [];

        // Process violations
        for (const violation of results.violations) {
            issues.push(...processAxeResults(violation, 'violation'));
        }

        // Process incomplete checks (needs manual review)
        for (const incomplete of results.incomplete) {
            issues.push(...processAxeResults(incomplete, 'incomplete'));
        }

        // Calculate summary
        const summary = {
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
        };

        return {
            url: window.location.href,
            timestamp: Date.now(),
            issues,
            summary,
            scanConfig: {
                axeVersion: results.testEngine.version,
                rules: results.violations.map(v => v.id),
            },
        };
    } catch (error) {
        console.error('Scan failed:', error);
        throw new Error(
            `Accessibility scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Transform axe-core results into our Issue format
 */
function processAxeResults(
    result: Result,
    type: 'violation' | 'incomplete'
): Issue[] {
    const issues: Issue[] = [];

    for (const node of result.nodes) {
        const selector = Array.isArray(node.target[0])
            ? node.target[0].join(' ')
            : node.target[0];
        const element = document.querySelector(
            selector as string
        ) as HTMLElement | null;

        // Get WCAG info
        const wcagTags = result.tags.filter(tag => tag.startsWith('wcag'));
        const wcagLevel = determineWCAGLevel(wcagTags);
        const wcagCriteria = wcagTags
            .filter(tag => tag.match(/wcag\d{3,4}/))
            .map(tag => tag.replace('wcag', ''));

        // Get element context
        const context = element ? getElementContext(element) : {};

        // Generate recommendations
        const recommendations = generateRecommendations(result, node, element);

        const issue: Issue = {
            id: generateId(),
            source: 'axe',
            ruleId: result.id,
            title: result.help,
            description: result.description,
            impact: (result.impact as ImpactLevel) || 'moderate',
            confidence: type === 'violation' ? 'high' : 'medium',
            wcag: {
                level: wcagLevel,
                criteria: wcagCriteria,
            },
            node: {
                selector: selector as string,
                snippet: node.html,
                xpath: Array.isArray(node.xpath) ? node.xpath[0] : node.xpath,
            },
            context,
            recommendations,
            status: 'open',
            tags: result.tags,
            timestamp: Date.now(),
            notes:
                type === 'incomplete'
                    ? 'This issue requires manual verification'
                    : undefined,
        };

        issues.push(issue);
    }

    return issues;
}

/**
 * Get accessibility context for an element
 */
function getElementContext(element: HTMLElement): Issue['context'] {
    const role = element.getAttribute('role') || element.tagName.toLowerCase();

    let accessibleName: string | undefined;
    try {
        accessibleName = computeAccessibleName(element);
    } catch {
        // computeAccessibleName might fail on some elements
        accessibleName = undefined;
    }

    const focusable =
        element.tabIndex >= 0 ||
        ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(
            element.tagName
        );

    // Get contrast ratio if applicable (text elements)
    let contrastRatio: number | undefined;
    if (element.textContent?.trim()) {
        const computedStyle = window.getComputedStyle(element);
        const color = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;

        if (color && backgroundColor) {
            contrastRatio = calculateContrastRatio(color, backgroundColor);
        }
    }

    return {
        role,
        accessibleName,
        focusable,
        contrastRatio,
    };
}

/**
 * Calculate WCAG contrast ratio between two colors
 */
function calculateContrastRatio(color1: string, color2: string): number {
    const getLuminance = (color: string): number => {
        const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
        const [r, g, b] = rgb.map(val => {
            const sRGB = val / 255;
            return sRGB <= 0.03928
                ? sRGB / 12.92
                : Math.pow((sRGB + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine WCAG level from tags
 */
function determineWCAGLevel(tags: string[]): 'A' | 'AA' | 'AAA' {
    if (
        tags.some(tag => tag.includes('wcag2aaa') || tag.includes('wcag21aaa'))
    ) {
        return 'AAA';
    }
    if (
        tags.some(
            tag =>
                tag.includes('wcag2aa') ||
                tag.includes('wcag21aa') ||
                tag.includes('wcag22aa')
        )
    ) {
        return 'AA';
    }
    return 'A';
}

/**
 * Generate role-specific recommendations
 */
function generateRecommendations(
    result: Result,
    node: any,
    element: HTMLElement | null
): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Developer recommendation
    const devRec: Recommendation = {
        role: 'developer',
        title: 'Fix this issue',
        description: result.help,
        priority:
            result.impact === 'critical' || result.impact === 'serious'
                ? 'high'
                : 'medium',
    };

    // Add code example if we have the element
    if (element && node.failureSummary) {
        devRec.codeExample = generateCodeExample(result.id, element);
    }

    recommendations.push(devRec);

    // QA recommendation
    recommendations.push({
        role: 'qa',
        title: 'Verify fix',
        description: `Test that ${result.help.toLowerCase()} after developer implements fix. Use screen reader and keyboard to verify.`,
        priority:
            result.impact === 'critical' || result.impact === 'serious'
                ? 'high'
                : 'medium',
    });

    // Designer recommendation (if relevant)
    if (isDesignRelated(result.id)) {
        recommendations.push({
            role: 'designer',
            title: 'Update design',
            description: getDesignRecommendation(result.id),
            priority:
                result.impact === 'critical' || result.impact === 'serious'
                    ? 'high'
                    : 'medium',
        });
    }

    return recommendations;
}

/**
 * Check if issue is design-related
 */
function isDesignRelated(ruleId: string): boolean {
    const designRules = [
        'color-contrast',
        'link-in-text-block',
        'focus-order-semantics',
        'target-size',
        'label-content-name-mismatch',
    ];
    return designRules.some(rule => ruleId.includes(rule));
}

/**
 * Get design-specific recommendation
 */
function getDesignRecommendation(ruleId: string): string {
    const recommendations: Record<string, string> = {
        'color-contrast':
            'Ensure text has sufficient contrast ratio (4.5:1 for normal text, 3:1 for large text). Use a color contrast checker.',
        'link-in-text-block':
            'Make links visually distinct from surrounding text (underline, different color with 3:1 contrast).',
        'focus-order-semantics':
            'Design visual layout to match logical tab order.',
        'target-size':
            'Ensure interactive elements are at least 44x44px (or 24x24px with sufficient spacing).',
        'label-content-name-mismatch':
            'Ensure visible label text matches or is contained in accessible name.',
    };

    for (const [key, value] of Object.entries(recommendations)) {
        if (ruleId.includes(key)) {
            return value;
        }
    }

    return 'Review design to ensure it supports accessibility requirements.';
}

/**
 * Generate code example for common fixes
 */
function generateCodeExample(ruleId: string, element: HTMLElement): string {
    const examples: Record<string, (el: HTMLElement) => string> = {
        label: el => {
            const id = el.id || 'input-id';
            return `<label for="${id}">Label text</label>\n<input id="${id}" type="text" />`;
        },
        'button-name': el =>
            `<button aria-label="Descriptive label">\n  ${el.innerHTML}\n</button>`,
        'image-alt': el =>
            `<img src="${el.getAttribute('src')}" alt="Descriptive text about the image" />`,
        'link-name': el =>
            `<a href="${el.getAttribute('href')}" aria-label="Descriptive link text">\n  ${el.innerHTML}\n</a>`,
    };

    for (const [key, fn] of Object.entries(examples)) {
        if (ruleId.includes(key)) {
            return fn(element);
        }
    }

    return element.outerHTML;
}
