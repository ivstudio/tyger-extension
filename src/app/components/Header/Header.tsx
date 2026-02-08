import { useScanState } from '@/app/context/useScanContext';
import { HeaderTitle } from './HeaderTitle';
import { HeaderActions } from './HeaderActions';
import { ViewModeTabs } from './ViewModeTabs';
import { SeverityBadges } from './SeverityBadges';

export default function Header() {
    const { currentScan } = useScanState();

    return (
        <header className="border-b border-border bg-card px-4 py-3">
            <div className="flex items-center justify-between">
                <HeaderTitle />
                <HeaderActions />
            </div>

            {currentScan && (
                <>
                    <ViewModeTabs />
                    <SeverityBadges />
                </>
            )}
        </header>
    );
}
