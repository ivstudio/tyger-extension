import { useState } from 'react';
import { useScanState, useScanDispatch } from '../../context/ScanContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Code, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { IssueStatus } from '@/types/issue';
import { updateIssueStatus } from '@/services/storage';
import { RecommendationCard } from './RecommendationCard';

export function IssueDetail() {
    const { selectedIssue, currentScan } = useScanState();
    const dispatch = useScanDispatch();
    const [notes, setNotes] = useState('');

    if (!selectedIssue) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Select an issue to view details
            </div>
        );
    }

    const handleStatusChange = async (status: IssueStatus) => {
        if (!currentScan) return;

        dispatch({
            type: 'UPDATE_ISSUE_STATUS',
            payload: { issueId: selectedIssue.id, status, notes },
        });

        await updateIssueStatus(
            currentScan.url,
            selectedIssue.id,
            status,
            notes
        );
    };

    const devRecommendations = selectedIssue.recommendations.filter(
        r => r.role === 'developer'
    );
    const qaRecommendations = selectedIssue.recommendations.filter(
        r => r.role === 'qa'
    );
    const designRecommendations = selectedIssue.recommendations.filter(
        r => r.role === 'designer'
    );

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <div className="mb-2 flex items-start justify-between">
                    <h2 className="text-xl font-semibold">
                        {selectedIssue.title}
                    </h2>
                    <Badge
                        variant="outline"
                        className={`wcag-${selectedIssue.wcag.level.toLowerCase()}`}
                    >
                        WCAG {selectedIssue.wcag.level}
                    </Badge>
                </div>
                <p className="text-muted-foreground">
                    {selectedIssue.description}
                </p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="text-muted-foreground">Impact:</span>
                    <Badge className="ml-2" variant="outline">
                        {selectedIssue.impact}
                    </Badge>
                </div>
                <div>
                    <span className="text-muted-foreground">Confidence:</span>
                    <Badge className="ml-2" variant="outline">
                        {selectedIssue.confidence}
                    </Badge>
                </div>
                <div className="col-span-2">
                    <span className="text-muted-foreground">
                        WCAG Criteria:
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                        {selectedIssue.wcag.criteria.map(criterion => (
                            <Badge key={criterion} variant="secondary">
                                {criterion}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            {/* Element Info */}
            <div>
                <h3 className="mb-2 flex items-center gap-2 font-semibold">
                    <Code className="h-4 w-4" />
                    Element
                </h3>
                <div className="rounded-md bg-muted p-3">
                    <div className="mb-1 text-xs text-muted-foreground">
                        Selector
                    </div>
                    <code className="font-mono text-sm">
                        {selectedIssue.node.selector}
                    </code>
                </div>
                <div className="mt-2 rounded-md bg-muted p-3">
                    <div className="mb-1 text-xs text-muted-foreground">
                        HTML
                    </div>
                    <pre className="overflow-x-auto font-mono text-xs">
                        {selectedIssue.node.snippet}
                    </pre>
                </div>
            </div>

            {/* Context */}
            {selectedIssue.context &&
                Object.keys(selectedIssue.context).length > 0 && (
                    <div>
                        <h3 className="mb-2 font-semibold">Context</h3>
                        <dl className="space-y-1 text-sm">
                            {selectedIssue.context.role && (
                                <>
                                    <dt className="text-muted-foreground">
                                        Role:
                                    </dt>
                                    <dd className="font-mono">
                                        {selectedIssue.context.role}
                                    </dd>
                                </>
                            )}
                            {selectedIssue.context.accessibleName && (
                                <>
                                    <dt className="text-muted-foreground">
                                        Accessible Name:
                                    </dt>
                                    <dd>
                                        {selectedIssue.context.accessibleName}
                                    </dd>
                                </>
                            )}
                            {selectedIssue.context.focusable !== undefined && (
                                <>
                                    <dt className="text-muted-foreground">
                                        Focusable:
                                    </dt>
                                    <dd>
                                        {selectedIssue.context.focusable
                                            ? 'Yes'
                                            : 'No'}
                                    </dd>
                                </>
                            )}
                            {selectedIssue.context.contrastRatio && (
                                <>
                                    <dt className="text-muted-foreground">
                                        Contrast Ratio:
                                    </dt>
                                    <dd>
                                        {selectedIssue.context.contrastRatio.toFixed(
                                            2
                                        )}
                                        :1
                                    </dd>
                                </>
                            )}
                        </dl>
                    </div>
                )}

            {/* Recommendations by Role */}
            <Tabs defaultValue="developer" className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger value="developer" className="flex-1">
                        Developer ({devRecommendations.length})
                    </TabsTrigger>
                    <TabsTrigger value="qa" className="flex-1">
                        QA ({qaRecommendations.length})
                    </TabsTrigger>
                    {designRecommendations.length > 0 && (
                        <TabsTrigger value="designer" className="flex-1">
                            Designer ({designRecommendations.length})
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="developer" className="space-y-3">
                    {devRecommendations.map((rec, idx) => (
                        <RecommendationCard key={idx} recommendation={rec} />
                    ))}
                </TabsContent>

                <TabsContent value="qa" className="space-y-3">
                    {qaRecommendations.map((rec, idx) => (
                        <RecommendationCard key={idx} recommendation={rec} />
                    ))}
                </TabsContent>

                {designRecommendations.length > 0 && (
                    <TabsContent value="designer" className="space-y-3">
                        {designRecommendations.map((rec, idx) => (
                            <RecommendationCard
                                key={idx}
                                recommendation={rec}
                            />
                        ))}
                    </TabsContent>
                )}
            </Tabs>

            {/* Status & Notes */}
            <div>
                <h3 className="mb-2 font-semibold">Status</h3>
                <div className="mb-3 flex gap-2">
                    <Button
                        size="sm"
                        variant={
                            selectedIssue.status === 'fixed'
                                ? 'default'
                                : 'outline'
                        }
                        onClick={() => handleStatusChange('fixed')}
                    >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Fixed
                    </Button>
                    <Button
                        size="sm"
                        variant={
                            selectedIssue.status === 'ignored'
                                ? 'default'
                                : 'outline'
                        }
                        onClick={() => handleStatusChange('ignored')}
                    >
                        <XCircle className="mr-1 h-4 w-4" />
                        Ignore
                    </Button>
                    <Button
                        size="sm"
                        variant={
                            selectedIssue.status === 'needs-design'
                                ? 'default'
                                : 'outline'
                        }
                        onClick={() => handleStatusChange('needs-design')}
                    >
                        Needs Design
                    </Button>
                </div>

                <textarea
                    className="w-full rounded-md border border-input p-2 text-sm"
                    placeholder="Add notes..."
                    rows={3}
                    value={notes || selectedIssue.notes || ''}
                    onChange={e => setNotes(e.target.value)}
                />
            </div>

            {/* Learn More */}
            <div>
                <a
                    href={`https://dequeuniversity.com/rules/axe/4.8/${selectedIssue.ruleId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button variant="outline" size="sm">
                        Learn More <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                </a>
            </div>
        </div>
    );
}
