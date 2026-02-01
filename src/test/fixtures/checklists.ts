import type {
    ChecklistItem,
    ChecklistCategory,
    ManualChecklist,
    ChecklistItemStatus,
} from '@/types/checklist';

export function createMockChecklistItem(
    overrides?: Partial<ChecklistItem>
): ChecklistItem {
    return {
        id: 'item-1',
        title: 'Test item',
        description: 'Test description',
        status: 'pending' as ChecklistItemStatus,
        ...overrides,
    };
}

export function createMockChecklistCategory(
    overrides?: Partial<ChecklistCategory>
): ChecklistCategory {
    return {
        id: 'category-1',
        title: 'Test Category',
        description: 'Test category description',
        items: [
            createMockChecklistItem({ id: 'item-1', title: 'Item 1' }),
            createMockChecklistItem({ id: 'item-2', title: 'Item 2' }),
        ],
        ...overrides,
    };
}

export function createMockManualChecklist(
    overrides?: Partial<ManualChecklist>
): ManualChecklist {
    return {
        url: 'https://example.com',
        timestamp: Date.now(),
        categories: [
            createMockChecklistCategory({
                id: 'keyboard',
                title: 'Keyboard Navigation',
            }),
        ],
        completed: false,
        ...overrides,
    };
}

export const mockKeyboardCategory: ChecklistCategory = {
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
    ],
};

export const mockScreenReaderCategory: ChecklistCategory = {
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
    ],
};
