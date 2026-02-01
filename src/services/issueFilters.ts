import type { Issue } from '@/types/issue';
import type { Filters } from '@/app/context/scanTypes';

/**
 * Returns true if an issue passes all active filters (severity, wcag, status, search).
 */
export function matchesFilters(issue: Issue, filters: Filters): boolean {
    if (
        filters.severity.length > 0 &&
        !filters.severity.includes(issue.impact)
    ) {
        return false;
    }
    if (filters.wcag.length > 0 && !filters.wcag.includes(issue.wcag.level)) {
        return false;
    }
    if (filters.status.length > 0 && !filters.status.includes(issue.status)) {
        return false;
    }
    if (filters.search) {
        const search = filters.search.toLowerCase();
        return (
            issue.title.toLowerCase().includes(search) ||
            issue.description.toLowerCase().includes(search) ||
            issue.ruleId.toLowerCase().includes(search)
        );
    }
    return true;
}

/**
 * Returns issues that pass the given filters.
 */
export function filterIssues(issues: Issue[], filters: Filters): Issue[] {
    return issues.filter(issue => matchesFilters(issue, filters));
}

/**
 * Returns whether any filters are active and the count of active filter dimensions.
 */
export function getFilterSummary(filters: Filters): {
    hasActive: boolean;
    count: number;
} {
    const count =
        filters.severity.length +
        filters.wcag.length +
        filters.status.length +
        (filters.search ? 1 : 0);
    return {
        hasActive: count > 0,
        count,
    };
}
