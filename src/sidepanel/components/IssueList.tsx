import { useScanState, useScanDispatch, useFilteredIssues } from '../context/ScanContext';
import { Issue, ImpactLevel } from '@/types/issue';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { sendMessage } from '@/lib/messaging';
import { MessageType } from '@/types/messages';

const severityConfig = {
  critical: {
    icon: AlertCircle,
    className: 'severity-critical',
    label: 'Critical'
  },
  serious: {
    icon: AlertTriangle,
    className: 'severity-serious',
    label: 'Serious'
  },
  moderate: {
    icon: AlertTriangle,
    className: 'severity-moderate',
    label: 'Moderate'
  },
  minor: {
    icon: Info,
    className: 'severity-minor',
    label: 'Minor'
  }
};

export default function IssueList() {
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
  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.impact]) {
      acc[issue.impact] = [];
    }
    acc[issue.impact].push(issue);
    return acc;
  }, {} as Record<ImpactLevel, Issue[]>);

  const severityOrder: ImpactLevel[] = ['critical', 'serious', 'moderate', 'minor'];

  return (
    <div className="divide-y divide-border">
      {severityOrder.map(severity => {
        const severityIssues = groupedIssues[severity];
        if (!severityIssues || severityIssues.length === 0) return null;

        const config = severityConfig[severity];
        const Icon = config.icon;

        return (
          <div key={severity}>
            <div className={cn('px-4 py-2 font-medium text-sm flex items-center gap-2', config.className)}>
              <Icon className="h-4 w-4" />
              {config.label} ({severityIssues.length})
            </div>
            {severityIssues.map(issue => (
              <IssueListItem
                key={issue.id}
                issue={issue}
                isSelected={selectedIssue?.id === issue.id}
                onSelect={() => dispatch({ type: 'SELECT_ISSUE', payload: issue })}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

interface IssueListItemProps {
  issue: Issue;
  isSelected: boolean;
  onSelect: () => void;
}

function IssueListItem({ issue, isSelected, onSelect }: IssueListItemProps) {
  const handleClick = () => {
    onSelect();
    // Send message to highlight this issue on the page
    sendMessage({
      type: MessageType.HIGHLIGHT_ISSUE,
      data: { issueId: issue.id }
    }).catch(err => console.error('Failed to highlight issue:', err));
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full text-left px-4 py-3 hover:bg-accent transition-colors border-l-2',
        isSelected ? 'bg-accent border-primary' : 'border-transparent'
      )}
    >
      <div className="font-medium text-sm mb-1">{issue.title}</div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className={`wcag-${issue.wcag.level.toLowerCase()}`}>
          WCAG {issue.wcag.level}
        </Badge>
        <span className="truncate">{issue.node.selector}</span>
      </div>
    </button>
  );
}
