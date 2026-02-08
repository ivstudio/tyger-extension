import { Badge } from '../ui/Badge';
import { useScanState, useViewMode } from '@/app/context/useScanContext';

export function SeverityBadges() {
    const { currentScan } = useScanState();
    const viewMode = useViewMode();

    if (!currentScan || viewMode !== 'issues') {
        return null;
    }

    const { bySeverity } = currentScan.summary;

    return (
        <div className="mt-3 flex gap-2">
            <Badge variant="outline" className="severity-critical">
                Critical: {bySeverity.critical}
            </Badge>
            <Badge variant="outline" className="severity-serious">
                Serious: {bySeverity.serious}
            </Badge>
            <Badge variant="outline" className="severity-moderate">
                Moderate: {bySeverity.moderate}
            </Badge>
            <Badge variant="outline" className="severity-minor">
                Minor: {bySeverity.minor}
            </Badge>
        </div>
    );
}
