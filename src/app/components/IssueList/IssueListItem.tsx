import { Issue } from '@/types/issue';
import { Badge } from '../ui/Badge';
import { cn } from '@/services/utils';
import { sendMessage } from '@/services/messaging';
import { MessageType } from '@/types/messages';

interface IssueListItemProps {
    issue: Issue;
    isSelected: boolean;
    onSelect: () => void;
}

export function IssueListItem({
    issue,
    isSelected,
    onSelect,
}: IssueListItemProps) {
    const handleClick = () => {
        onSelect();
        // Send message to highlight this issue on the page
        sendMessage({
            type: MessageType.HIGHLIGHT_ISSUE,
            data: { issueId: issue.id },
        }).catch(err => console.error('Failed to highlight issue:', err));
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                'w-full border-l-2 px-4 py-3 text-left transition-colors hover:bg-accent',
                isSelected ? 'border-primary bg-accent' : 'border-transparent'
            )}
        >
            <div className="mb-1 text-sm font-medium">{issue.title}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge
                    variant="outline"
                    className={`wcag-${issue.wcag.level.toLowerCase()}`}
                >
                    WCAG {issue.wcag.level}
                </Badge>
                <span className="truncate">{issue.node.selector}</span>
            </div>
        </button>
    );
}
