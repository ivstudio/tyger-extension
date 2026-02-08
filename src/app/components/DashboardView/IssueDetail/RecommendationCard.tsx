import { Recommendation } from '@/types/issue';
import { Badge } from '@/app/components/ui/Badge';

interface RecommendationCardProps {
    recommendation: Recommendation;
}

export function RecommendationCard({
    recommendation,
}: RecommendationCardProps) {
    return (
        <div className="rounded-md border border-border p-3">
            <div className="mb-2 flex items-center justify-between">
                <h4 className="font-medium">{recommendation.title}</h4>
                <Badge
                    variant={
                        recommendation.priority === 'high'
                            ? 'destructive'
                            : 'secondary'
                    }
                >
                    {recommendation.priority}
                </Badge>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">
                {recommendation.description}
            </p>
            {recommendation.codeExample && (
                <pre className="overflow-x-auto rounded bg-muted p-2 font-mono text-xs">
                    {recommendation.codeExample}
                </pre>
            )}
        </div>
    );
}
