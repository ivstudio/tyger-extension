import type {
    Issue,
    ImpactLevel,
    ConfidenceLevel,
    WCAGLevel,
    IssueSource,
    Recommendation,
} from '@/types/issue';

let issueIdCounter = 0;

export function createMockIssue(overrides?: Partial<Issue>): Issue {
    issueIdCounter++;
    return {
        id: `issue-${issueIdCounter}`,
        source: 'axe' as IssueSource,
        ruleId: 'color-contrast',
        title: 'Elements must have sufficient color contrast',
        description:
            'Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds',
        impact: 'serious' as ImpactLevel,
        confidence: 'high' as ConfidenceLevel,
        wcag: {
            level: 'AA' as WCAGLevel,
            criteria: ['1.4.3'],
        },
        node: {
            selector: 'button.btn-primary',
            snippet: '<button class="btn-primary">Submit</button>',
            xpath: '/html/body/form/button',
        },
        context: {
            role: 'button',
            accessibleName: 'Submit',
            focusable: true,
            contrastRatio: 2.5,
        },
        recommendations: [
            {
                role: 'developer',
                title: 'Increase color contrast',
                description:
                    'Adjust foreground or background color to meet 4.5:1 contrast ratio',
                codeExample: 'color: #000; background: #fff;',
                priority: 'high',
            },
        ],
        status: 'open',
        tags: ['wcag2aa', 'wcag143', 'color-contrast'],
        timestamp: Date.now(),
        ...overrides,
    };
}

export function createMockRecommendation(
    overrides?: Partial<Recommendation>
): Recommendation {
    return {
        role: 'developer',
        title: 'Fix accessibility issue',
        description: 'This is a recommendation to fix the issue',
        priority: 'high',
        ...overrides,
    };
}

// Preset issues for common test scenarios
export const mockColorContrastIssue = createMockIssue({
    id: 'color-contrast-1',
    ruleId: 'color-contrast',
    title: 'Elements must have sufficient color contrast',
    impact: 'serious',
    wcag: { level: 'AA', criteria: ['1.4.3'] },
    tags: ['wcag2aa', 'wcag143'],
});

export const mockMissingAltIssue = createMockIssue({
    id: 'image-alt-1',
    ruleId: 'image-alt',
    title: 'Images must have alternate text',
    impact: 'critical',
    wcag: { level: 'A', criteria: ['1.1.1'] },
    node: {
        selector: 'img.product-image',
        snippet: '<img class="product-image" src="product.jpg" />',
    },
    tags: ['wcag2a', 'wcag111'],
});

export const mockFormLabelIssue = createMockIssue({
    id: 'label-1',
    ruleId: 'label',
    title: 'Form elements must have labels',
    impact: 'critical',
    wcag: { level: 'A', criteria: ['4.1.2'] },
    node: {
        selector: 'input#email',
        snippet: '<input type="email" id="email" />',
    },
    context: {
        role: 'textbox',
        focusable: true,
    },
    tags: ['wcag2a', 'wcag412'],
});

export const mockHeadingOrderIssue = createMockIssue({
    id: 'heading-order-1',
    ruleId: 'heading-order',
    title: 'Heading levels should only increase by one',
    impact: 'moderate',
    wcag: { level: 'A', criteria: ['1.3.1'] },
    node: {
        selector: 'h4.section-title',
        snippet: '<h4 class="section-title">Details</h4>',
    },
    tags: ['wcag2a', 'wcag131'],
});

export const mockIssues: Issue[] = [
    mockColorContrastIssue,
    mockMissingAltIssue,
    mockFormLabelIssue,
    mockHeadingOrderIssue,
];

// Reset counter for predictable IDs in tests
export function resetIssueIdCounter() {
    issueIdCounter = 0;
}
