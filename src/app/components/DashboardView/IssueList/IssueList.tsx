import {
    useScanState,
    useScanDispatch,
    useFilteredIssues,
} from '@/app/context/useScanContext';
import { Issue, ImpactLevel } from '@/types/issue';
import { cn } from '@/services/utils';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { IssueListItem } from './IssueListItem';

const severityConfig = {
    critical: {
        icon: AlertCircle,
        className: 'severity-critical',
        label: 'Critical',
    },
    serious: {
        icon: AlertTriangle,
        className: 'severity-serious',
        label: 'Serious',
    },
    moderate: {
        icon: AlertTriangle,
        className: 'severity-moderate',
        label: 'Moderate',
    },
    minor: {
        icon: Info,
        className: 'severity-minor',
        label: 'Minor',
    },
};

export function IssueList() {
    const { selectedIssue } = useScanState();
    const dispatch = useScanDispatch();
    const issues = useFilteredIssues();

    if (issues.length === 0) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                No issues found
            </div>
        );
    }

    // Group issues by severity
    const groupedIssues = issues.reduce(
        (acc: Record<ImpactLevel, Issue[]>, issue: Issue) => {
            if (!acc[issue.impact]) {
                acc[issue.impact] = [];
            }
            acc[issue.impact].push(issue);
            return acc;
        },
        {} as Record<ImpactLevel, Issue[]>
    );

    const severityOrder: ImpactLevel[] = [
        'critical',
        'serious',
        'moderate',
        'minor',
    ];

    return (
        <div className="divide-y divide-border">
            {severityOrder.map(severity => {
                const severityIssues = groupedIssues[severity];
                if (!severityIssues || severityIssues.length === 0) return null;

                const config = severityConfig[severity];
                const Icon = config.icon;

                return (
                    <div key={severity}>
                        <div
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 text-sm font-medium',
                                config.className
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {config.label} ({severityIssues.length})
                        </div>
                        {severityIssues.map((issue: Issue) => (
                            <IssueListItem
                                key={issue.id}
                                issue={issue}
                                isSelected={selectedIssue?.id === issue.id}
                                onSelect={() =>
                                    dispatch({
                                        type: 'SELECT_ISSUE',
                                        payload: issue,
                                    })
                                }
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    );
}
