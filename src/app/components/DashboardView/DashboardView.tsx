import { IssueList } from '@/app/components/DashboardView/IssueList';
import { IssueDetail } from '@/app/components/DashboardView/IssueDetail';

export function DashboardView() {
    return (
        <div className="flex min-h-0 flex-1 overflow-hidden">
            <aside
                className="flex min-h-0 w-80 shrink-0 flex-col overflow-auto border-r border-border"
                aria-label="Issues list"
            >
                <IssueList />
            </aside>
            <div className="min-h-0 min-w-0 flex-1 overflow-auto">
                <IssueDetail />
            </div>
        </div>
    );
}
