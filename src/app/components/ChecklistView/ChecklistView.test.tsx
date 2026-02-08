import { describe, it, expect } from 'vitest';
import { DEFAULT_CHECKLISTS } from '@/types/checklist';
import type { ChecklistCategory } from '@/types/checklist';
import type { Issue } from '@/types/issue';

describe('ChecklistView - Incomplete Checks Integration Logic', () => {
    // Simulate the displayCategories logic
    function mergeIncompleteChecksWithCategories(
        checklistCategories: ChecklistCategory[],
        incompleteChecks: Issue[]
    ): ChecklistCategory[] {
        const categories = [...checklistCategories];

        if (incompleteChecks.length === 0) {
            return categories;
        }

        // Create incomplete checks category
        const incompleteChecksCategory: ChecklistCategory = {
            id: 'automated-incomplete',
            title: 'Automated Checks Requiring Review',
            description:
                'Issues flagged by automated scanning that need manual verification',
            items: incompleteChecks.map(issue => ({
                id: issue.id,
                title: issue.title,
                description: issue.description,
                status: 'pending' as const,
                notes: issue.notes,
            })),
        };

        // Check if category already exists
        const existingIndex = categories.findIndex(
            cat => cat.id === 'automated-incomplete'
        );

        if (existingIndex >= 0) {
            // Update existing category
            categories[existingIndex] = incompleteChecksCategory;
        } else {
            // Add new category at the beginning
            categories.unshift(incompleteChecksCategory);
        }

        return categories;
    }

    it('should add incomplete checks category when incomplete checks exist', () => {
        const mockIncompleteCheck: Issue = {
            id: 'incomplete-1',
            source: 'axe',
            ruleId: 'color-contrast',
            title: 'Color contrast needs verification',
            description: 'Check with manual tools',
            impact: 'serious',
            confidence: 'medium',
            wcag: { level: 'AA', criteria: ['143'] },
            node: { selector: '.test', snippet: '<div></div>' },
            context: {},
            recommendations: [],
            status: 'open',
            tags: [],
            timestamp: Date.now(),
        };

        const result = mergeIncompleteChecksWithCategories(DEFAULT_CHECKLISTS, [
            mockIncompleteCheck,
        ]);

        // Should have one more category than default
        expect(result.length).toBe(DEFAULT_CHECKLISTS.length + 1);

        // First category should be automated-incomplete
        expect(result[0].id).toBe('automated-incomplete');
        expect(result[0].title).toBe('Automated Checks Requiring Review');
        expect(result[0].items).toHaveLength(1);
        expect(result[0].items[0].title).toBe(
            'Color contrast needs verification'
        );
    });

    it('should not add category when no incomplete checks exist', () => {
        const result = mergeIncompleteChecksWithCategories(
            DEFAULT_CHECKLISTS,
            []
        );

        // Should have same number of categories
        expect(result.length).toBe(DEFAULT_CHECKLISTS.length);

        // Should not have automated-incomplete category
        expect(
            result.find(cat => cat.id === 'automated-incomplete')
        ).toBeUndefined();
    });

    it('should update existing automated-incomplete category', () => {
        const existingCategory: ChecklistCategory = {
            id: 'automated-incomplete',
            title: 'Automated Checks Requiring Review',
            description: 'Old description',
            items: [
                {
                    id: 'old-1',
                    title: 'Old check',
                    description: 'Old',
                    status: 'pass',
                },
            ],
        };

        const categoriesWithExisting = [
            existingCategory,
            ...DEFAULT_CHECKLISTS,
        ];

        const newIncompleteCheck: Issue = {
            id: 'new-1',
            source: 'axe',
            ruleId: 'image-alt',
            title: 'New incomplete check',
            description: 'New check description',
            impact: 'critical',
            confidence: 'medium',
            wcag: { level: 'A', criteria: ['111'] },
            node: { selector: 'img', snippet: '<img>' },
            context: {},
            recommendations: [],
            status: 'open',
            tags: [],
            timestamp: Date.now(),
        };

        const result = mergeIncompleteChecksWithCategories(
            categoriesWithExisting,
            [newIncompleteCheck]
        );

        // Should still have same number of categories (replaced, not added)
        expect(result.length).toBe(categoriesWithExisting.length);

        // First category should be the updated automated-incomplete
        expect(result[0].id).toBe('automated-incomplete');
        expect(result[0].items).toHaveLength(1);
        expect(result[0].items[0].id).toBe('new-1');
        expect(result[0].items[0].title).toBe('New incomplete check');
    });

    it('should handle multiple incomplete checks', () => {
        const incompleteChecks: Issue[] = [
            {
                id: 'check-1',
                source: 'axe',
                ruleId: 'rule-1',
                title: 'First check',
                description: 'First',
                impact: 'serious',
                confidence: 'medium',
                wcag: { level: 'AA', criteria: [] },
                node: { selector: '.a', snippet: '' },
                context: {},
                recommendations: [],
                status: 'open',
                tags: [],
                timestamp: Date.now(),
            },
            {
                id: 'check-2',
                source: 'axe',
                ruleId: 'rule-2',
                title: 'Second check',
                description: 'Second',
                impact: 'moderate',
                confidence: 'medium',
                wcag: { level: 'A', criteria: [] },
                node: { selector: '.b', snippet: '' },
                context: {},
                recommendations: [],
                status: 'open',
                tags: [],
                timestamp: Date.now(),
            },
        ];

        const result = mergeIncompleteChecksWithCategories(
            DEFAULT_CHECKLISTS,
            incompleteChecks
        );

        const automatedCategory = result.find(
            cat => cat.id === 'automated-incomplete'
        );

        expect(automatedCategory).toBeDefined();
        expect(automatedCategory!.items).toHaveLength(2);
        expect(automatedCategory!.items[0].title).toBe('First check');
        expect(automatedCategory!.items[1].title).toBe('Second check');
    });

    it('should preserve incomplete check notes', () => {
        const incompleteCheck: Issue = {
            id: 'check-1',
            source: 'axe',
            ruleId: 'color-contrast',
            title: 'Check title',
            description: 'Check description',
            impact: 'serious',
            confidence: 'medium',
            wcag: { level: 'AA', criteria: [] },
            node: { selector: '.test', snippet: '' },
            context: {},
            recommendations: [],
            status: 'open',
            tags: [],
            timestamp: Date.now(),
            notes: 'This issue requires manual verification',
        };

        const result = mergeIncompleteChecksWithCategories(DEFAULT_CHECKLISTS, [
            incompleteCheck,
        ]);

        const automatedCategory = result[0];
        expect(automatedCategory.items[0].notes).toBe(
            'This issue requires manual verification'
        );
    });
});
