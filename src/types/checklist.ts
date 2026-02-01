export type ChecklistItemStatus = 'pass' | 'fail' | 'skip' | 'pending';

export interface ChecklistItem {
    id: string;
    title: string;
    description: string;
    status: ChecklistItemStatus;
    notes?: string;
}

export interface ChecklistCategory {
    id: string;
    title: string;
    description: string;
    items: ChecklistItem[];
}

export interface ManualChecklist {
    url: string;
    timestamp: number;
    categories: ChecklistCategory[];
    completed: boolean;
}

export const DEFAULT_CHECKLISTS: ChecklistCategory[] = [
    {
        id: 'keyboard-navigation',
        title: 'Keyboard Navigation',
        description: 'Verify keyboard accessibility without a mouse',
        items: [
            {
                id: 'tab-order',
                title: 'Tab order is logical and follows visual flow',
                description:
                    'Use Tab key to navigate through interactive elements. Order should match visual layout.',
                status: 'pending',
            },
            {
                id: 'focus-visible',
                title: 'Focus indicators are clearly visible',
                description:
                    'All focusable elements show a visible outline or highlight when focused.',
                status: 'pending',
            },
            {
                id: 'no-keyboard-trap',
                title: 'No keyboard traps present',
                description:
                    'Users can navigate into and out of all components using only keyboard.',
                status: 'pending',
            },
            {
                id: 'skip-links',
                title: 'Skip navigation links are present',
                description:
                    'Skip to main content or skip navigation links are available on pages with repeated content.',
                status: 'pending',
            },
            {
                id: 'interactive-controls',
                title: 'All interactive controls are keyboard accessible',
                description:
                    'Buttons, links, form fields, and custom widgets can be activated with keyboard (Enter/Space).',
                status: 'pending',
            },
        ],
    },
    {
        id: 'screen-reader',
        title: 'Screen Reader',
        description: 'Test with NVDA, JAWS, or VoiceOver',
        items: [
            {
                id: 'landmarks',
                title: 'Proper landmark regions are used',
                description:
                    'Page uses semantic HTML (header, nav, main, aside, footer) or ARIA landmarks.',
                status: 'pending',
            },
            {
                id: 'heading-structure',
                title: 'Heading hierarchy is logical',
                description:
                    'Headings (h1-h6) are properly nested without skipping levels.',
                status: 'pending',
            },
            {
                id: 'alt-text',
                title: 'Images have appropriate alt text',
                description:
                    'Informative images have descriptive alt text, decorative images use alt="".',
                status: 'pending',
            },
            {
                id: 'form-labels',
                title: 'Form inputs have associated labels',
                description:
                    'All form fields have visible labels or aria-label/aria-labelledby attributes.',
                status: 'pending',
            },
            {
                id: 'link-context',
                title: 'Links have descriptive text',
                description:
                    'Link text describes the destination (avoid "click here" or "read more" without context).',
                status: 'pending',
            },
            {
                id: 'dynamic-content',
                title: 'Dynamic content changes are announced',
                description:
                    'ARIA live regions announce important updates (errors, notifications, loading states).',
                status: 'pending',
            },
        ],
    },
    {
        id: 'zoom-reflow',
        title: 'Zoom & Reflow',
        description: 'Test at different zoom levels and viewport sizes',
        items: [
            {
                id: 'zoom-200',
                title: 'Content is usable at 200% zoom',
                description:
                    'Page remains functional and readable at 200% browser zoom without horizontal scrolling.',
                status: 'pending',
            },
            {
                id: 'zoom-400',
                title: 'Content reflows at 400% zoom',
                description:
                    'At 400% zoom, content reflows into a single column without loss of information.',
                status: 'pending',
            },
            {
                id: 'text-resize',
                title: 'Text can be resized to 200%',
                description:
                    'Users can increase text size to 200% without loss of content or functionality.',
                status: 'pending',
            },
            {
                id: 'no-horizontal-scroll',
                title: 'No horizontal scrolling at standard zoom',
                description:
                    'Content fits viewport width at standard zoom (except data tables/code).',
                status: 'pending',
            },
        ],
    },
    {
        id: 'reduced-motion',
        title: 'Reduced Motion',
        description: 'Test with prefers-reduced-motion enabled',
        items: [
            {
                id: 'animation-disabled',
                title: 'Animations are disabled or reduced',
                description:
                    'When prefers-reduced-motion is enabled, animations either stop or use reduced motion.',
                status: 'pending',
            },
            {
                id: 'essential-motion-only',
                title: 'Only essential motion remains',
                description:
                    'Motion that is essential to functionality (e.g., progress indicators) is still present.',
                status: 'pending',
            },
            {
                id: 'no-auto-play',
                title: 'No auto-playing animations',
                description:
                    'Content does not auto-play animations longer than 5 seconds, or provides controls to pause.',
                status: 'pending',
            },
        ],
    },
    {
        id: 'focus-management',
        title: 'Focus Management',
        description: 'Test focus behavior in dynamic interactions',
        items: [
            {
                id: 'modal-focus',
                title: 'Focus is trapped in modals',
                description:
                    'When modal opens, focus moves to modal and stays within until closed.',
                status: 'pending',
            },
            {
                id: 'modal-return',
                title: 'Focus returns after modal closes',
                description:
                    'After closing modal, focus returns to trigger element.',
                status: 'pending',
            },
            {
                id: 'deletion-focus',
                title: 'Focus moves appropriately after deletion',
                description:
                    'When deleting items, focus moves to a logical location (next item, previous item, or container).',
                status: 'pending',
            },
            {
                id: 'spa-navigation',
                title: 'Focus is managed during route changes',
                description:
                    'In single-page apps, focus moves to new content on route change (typically h1 or main).',
                status: 'pending',
            },
        ],
    },
];
