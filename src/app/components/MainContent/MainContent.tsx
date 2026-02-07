import { ViewMode } from '@/app/context/scanTypes';
import { IssueList } from '@/app/components/IssueList';
import { IssueDetail } from '@/app/components/IssueDetail';
import { ChecklistView } from '@/app/components/ChecklistView';
import { FilterBar } from '@/app/components/FilterBar';

type MainContentProps = {
    viewMode: ViewMode;
};

export function MainContent({ viewMode }: MainContentProps) {
    if (viewMode === 'checklist') {
        return (
            <div className="flex flex-1 justify-center overflow-hidden">
                <ChecklistView />
            </div>
        );
    }

    return (
        <div className="flex flex-1 justify-center overflow-hidden">
            <FilterBar />
            <div className="w-2/5 overflow-y-auto border-r border-border">
                <IssueList />
            </div>
            <div className="flex-1 overflow-y-auto">
                <IssueDetail />
            </div>
        </div>
    );
}
