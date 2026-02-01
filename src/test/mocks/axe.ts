import { vi } from 'vitest';
import type { Result as AxeResult } from 'axe-core';

// Mock axe-core results
export const mockAxeViolation: AxeResult = {
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
            html: '<button class="btn">Click me</button>',
            target: ['button.btn'],
            failureSummary:
                'Fix any of the following:\n  Element has insufficient color contrast of 2.1:1',
        },
    ],
};

export const mockAxePass: AxeResult = {
    id: 'label',
    impact: null,
    tags: ['wcag2a', 'wcag412'],
    description: 'Ensures every form element has a label',
    help: 'Form elements must have labels',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/label',
    nodes: [],
};

export const mockAxeIncomplete: AxeResult = {
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
            html: '<div style="background-image: url(...)">Text</div>',
            target: ['div'],
            failureSummary:
                "Fix any of the following:\n  Element's background color could not be determined due to background image",
        },
    ],
};

// Mock axe.run() response
export const mockAxeResults = {
    violations: [mockAxeViolation],
    passes: [mockAxePass],
    incomplete: [mockAxeIncomplete],
    inapplicable: [],
    timestamp: new Date().toISOString(),
    url: 'https://example.com',
};

// Mock axe configuration
export const mockAxeConfig = {
    runOnly: {
        type: 'tag' as const,
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    },
    resultTypes: ['violations', 'incomplete'],
};

// Create axe-core mock
export const createAxeMock = () => ({
    run: vi.fn(() => Promise.resolve(mockAxeResults)),
    configure: vi.fn(),
    reset: vi.fn(),
});

// Export default mock
export const mockAxe = createAxeMock();

// Setup global axe if needed
if (typeof globalThis !== 'undefined') {
    (globalThis as any).axe = mockAxe;
}
