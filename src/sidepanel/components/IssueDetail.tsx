import { useState } from 'react';
import { useScanState, useScanDispatch } from '../context/ScanContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Code, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { Recommendation, IssueStatus } from '@/types/issue';
import { updateIssueStatus } from '@/lib/storage';

export default function IssueDetail() {
  const { selectedIssue, currentScan } = useScanState();
  const dispatch = useScanDispatch();
  const [notes, setNotes] = useState('');

  if (!selectedIssue) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select an issue to view details
      </div>
    );
  }

  const handleStatusChange = async (status: IssueStatus) => {
    if (!currentScan) return;

    dispatch({
      type: 'UPDATE_ISSUE_STATUS',
      payload: { issueId: selectedIssue.id, status, notes }
    });

    await updateIssueStatus(currentScan.url, selectedIssue.id, status, notes);
  };

  const devRecommendations = selectedIssue.recommendations.filter(r => r.role === 'developer');
  const qaRecommendations = selectedIssue.recommendations.filter(r => r.role === 'qa');
  const designRecommendations = selectedIssue.recommendations.filter(r => r.role === 'designer');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-xl font-semibold">{selectedIssue.title}</h2>
          <Badge variant="outline" className={`wcag-${selectedIssue.wcag.level.toLowerCase()}`}>
            WCAG {selectedIssue.wcag.level}
          </Badge>
        </div>
        <p className="text-muted-foreground">{selectedIssue.description}</p>
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
          <span className="text-muted-foreground">WCAG Criteria:</span>
          <div className="flex flex-wrap gap-1 mt-1">
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
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Code className="h-4 w-4" />
          Element
        </h3>
        <div className="bg-muted p-3 rounded-md">
          <div className="text-xs text-muted-foreground mb-1">Selector</div>
          <code className="text-sm font-mono">{selectedIssue.node.selector}</code>
        </div>
        <div className="bg-muted p-3 rounded-md mt-2">
          <div className="text-xs text-muted-foreground mb-1">HTML</div>
          <pre className="text-xs font-mono overflow-x-auto">{selectedIssue.node.snippet}</pre>
        </div>
      </div>

      {/* Context */}
      {selectedIssue.context && Object.keys(selectedIssue.context).length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Context</h3>
          <dl className="text-sm space-y-1">
            {selectedIssue.context.role && (
              <>
                <dt className="text-muted-foreground">Role:</dt>
                <dd className="font-mono">{selectedIssue.context.role}</dd>
              </>
            )}
            {selectedIssue.context.accessibleName && (
              <>
                <dt className="text-muted-foreground">Accessible Name:</dt>
                <dd>{selectedIssue.context.accessibleName}</dd>
              </>
            )}
            {selectedIssue.context.focusable !== undefined && (
              <>
                <dt className="text-muted-foreground">Focusable:</dt>
                <dd>{selectedIssue.context.focusable ? 'Yes' : 'No'}</dd>
              </>
            )}
            {selectedIssue.context.contrastRatio && (
              <>
                <dt className="text-muted-foreground">Contrast Ratio:</dt>
                <dd>{selectedIssue.context.contrastRatio.toFixed(2)}:1</dd>
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
              <RecommendationCard key={idx} recommendation={rec} />
            ))}
          </TabsContent>
        )}
      </Tabs>

      {/* Status & Notes */}
      <div>
        <h3 className="font-semibold mb-2">Status</h3>
        <div className="flex gap-2 mb-3">
          <Button
            size="sm"
            variant={selectedIssue.status === 'fixed' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('fixed')}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Fixed
          </Button>
          <Button
            size="sm"
            variant={selectedIssue.status === 'ignored' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('ignored')}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Ignore
          </Button>
          <Button
            size="sm"
            variant={selectedIssue.status === 'needs-design' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('needs-design')}
          >
            Needs Design
          </Button>
        </div>

        <textarea
          className="w-full p-2 border border-input rounded-md text-sm"
          placeholder="Add notes..."
          rows={3}
          value={notes || selectedIssue.notes || ''}
          onChange={(e) => setNotes(e.target.value)}
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
            Learn More <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </a>
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  return (
    <div className="border border-border rounded-md p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{recommendation.title}</h4>
        <Badge variant={recommendation.priority === 'high' ? 'destructive' : 'secondary'}>
          {recommendation.priority}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{recommendation.description}</p>
      {recommendation.codeExample && (
        <pre className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto">
          {recommendation.codeExample}
        </pre>
      )}
    </div>
  );
}
