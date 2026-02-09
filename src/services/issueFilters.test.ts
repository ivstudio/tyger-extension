import { describe, it, expect } from 'vitest';
import { matchesFilters, filterIssues, getFilterSummary } from './issueFilters';
import {
    createMockIssue,
    mockColorContrastIssue,
    mockMissingAltIssue,
    mockFormLabelIssue,
    mockHeadingOrderIssue,
} from '@/test/fixtures/issues';
import type { Filters } from '@/app/context/scanTypes';

const emptyFilters: Filters = {
    severity: [],
    wcag: [],
    status: [],
    search: '',
};

describe('issueFilters', () => {
    describe('matchesFilters', () => {
        it('returns true when no filters are active', () => {
            const issue = createMockIssue();
            expect(matchesFilters(issue, emptyFilters)).toBe(true);
        });

        it('returns false when severity filter excludes the issue', () => {
            const issue = createMockIssue({ impact: 'serious' });
            const filters: Filters = {
                ...emptyFilters,
                severity: ['critical'],
            };
            expect(matchesFilters(issue, filters)).toBe(false);
        });

        it('returns true when issue severity is in filter', () => {
            const issue = createMockIssue({ impact: 'serious' });
            const filters: Filters = {
                ...emptyFilters,
                severity: ['critical', 'serious'],
            };
            expect(matchesFilters(issue, filters)).toBe(true);
        });

        it('returns false when wcag filter excludes the issue', () => {
            const issue = createMockIssue({
                wcag: { level: 'AA', criteria: ['1.4.3'] },
            });
            const filters: Filters = {
                ...emptyFilters,
                wcag: ['A'],
            };
            expect(matchesFilters(issue, filters)).toBe(false);
        });

        it('returns true when issue wcag level is in filter', () => {
            const issue = createMockIssue({
                wcag: { level: 'AA', criteria: ['1.4.3'] },
            });
            const filters: Filters = {
                ...emptyFilters,
                wcag: ['A', 'AA'],
            };
            expect(matchesFilters(issue, filters)).toBe(true);
        });

        it('returns false when status filter excludes the issue', () => {
            const issue = createMockIssue({ status: 'open' });
            const filters: Filters = {
                ...emptyFilters,
                status: ['fixed'],
            };
            expect(matchesFilters(issue, filters)).toBe(false);
        });

        it('returns true when issue status is in filter', () => {
            const issue = createMockIssue({ status: 'open' });
            const filters: Filters = {
                ...emptyFilters,
                status: ['open', 'fixed'],
            };
            expect(matchesFilters(issue, filters)).toBe(true);
        });

        it('returns true when search matches title (case insensitive)', () => {
            const issue = createMockIssue({ title: 'Color Contrast Problem' });
            const filters: Filters = {
                ...emptyFilters,
                search: 'contrast',
            };
            expect(matchesFilters(issue, filters)).toBe(true);
        });

        it('returns true when search matches description', () => {
            const issue = createMockIssue({
                description: 'Ensures contrast meets WCAG AA',
            });
            const filters: Filters = {
                ...emptyFilters,
                search: 'wcag',
            };
            expect(matchesFilters(issue, filters)).toBe(true);
        });

        it('returns true when search matches ruleId', () => {
            const issue = createMockIssue({ ruleId: 'color-contrast' });
            const filters: Filters = {
                ...emptyFilters,
                search: 'color-contrast',
            };
            expect(matchesFilters(issue, filters)).toBe(true);
        });

        it('returns false when search matches no field', () => {
            const issue = createMockIssue({
                title: 'Foo',
                description: 'Bar',
                ruleId: 'baz',
            });
            const filters: Filters = {
                ...emptyFilters,
                search: 'nonexistent',
            };
            expect(matchesFilters(issue, filters)).toBe(false);
        });

        it('combines severity and search: fails severity first', () => {
            const issue = createMockIssue({
                impact: 'minor',
                title: 'Contrast',
            });
            const filters: Filters = {
                ...emptyFilters,
                severity: ['critical'],
                search: 'contrast',
            };
            expect(matchesFilters(issue, filters)).toBe(false);
        });
    });

    describe('filterIssues', () => {
        it('returns all issues when no filters active', () => {
            const issues = [
                mockColorContrastIssue,
                mockMissingAltIssue,
                mockFormLabelIssue,
            ];
            expect(filterIssues(issues, emptyFilters)).toEqual(issues);
        });

        it('returns only issues matching severity filter', () => {
            const issues = [
                mockColorContrastIssue,
                mockMissingAltIssue,
                mockFormLabelIssue,
                mockHeadingOrderIssue,
            ];
            const filters: Filters = {
                ...emptyFilters,
                severity: ['critical'],
            };
            const result = filterIssues(issues, filters);
            expect(result).toHaveLength(2);
            expect(result.map(i => i.id)).toContain('image-alt-1');
            expect(result.map(i => i.id)).toContain('label-1');
        });

        it('returns empty array when no issues match', () => {
            const issues = [mockColorContrastIssue];
            const filters: Filters = {
                ...emptyFilters,
                severity: ['minor'],
            };
            expect(filterIssues(issues, filters)).toEqual([]);
        });
    });

    describe('getFilterSummary', () => {
        it('returns hasActive false and count 0 when no filters', () => {
            expect(getFilterSummary(emptyFilters)).toEqual({
                hasActive: false,
                count: 0,
            });
        });

        it('returns hasActive true and count when severity filter set', () => {
            const filters: Filters = {
                ...emptyFilters,
                severity: ['critical', 'serious'],
            };
            expect(getFilterSummary(filters)).toEqual({
                hasActive: true,
                count: 2,
            });
        });

        it('counts search as one dimension', () => {
            const filters: Filters = {
                ...emptyFilters,
                search: 'contrast',
            };
            expect(getFilterSummary(filters)).toEqual({
                hasActive: true,
                count: 1,
            });
        });

        it('sums all filter dimensions', () => {
            const filters: Filters = {
                severity: ['critical'],
                wcag: ['AA'],
                status: ['open'],
                search: 'test',
            };
            expect(getFilterSummary(filters)).toEqual({
                hasActive: true,
                count: 4,
            });
        });
    });
});
