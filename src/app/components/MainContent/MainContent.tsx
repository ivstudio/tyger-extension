import { useViewMode } from '@/app/context/useScanContext';
import { ChecklistView } from '@/app/components/ChecklistView';
import { Header } from '@/app/components/Header';
import { DashboardView } from '@/app/components/DashboardView';

export function MainContent() {
    const viewMode = useViewMode();
    const isChecklist = viewMode === 'checklist';
    return (
        <div className="flex h-screen flex-col bg-background">
            <Header />
            <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {isChecklist ? <ChecklistView /> : <DashboardView />}
            </main>
        </div>
    );
}
