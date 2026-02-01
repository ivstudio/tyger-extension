export function IssueListSkeleton() {
    return (
        <div className="animate-pulse divide-y divide-border">
            {/* Skeleton severity group */}
            <div>
                <div className="flex items-center gap-2 px-4 py-2">
                    <div className="h-4 w-4 rounded bg-muted" />
                    <div className="h-4 w-24 rounded bg-muted" />
                </div>
                {/* Skeleton issue items */}
                {[1, 2, 3].map(i => (
                    <div
                        key={i}
                        className="border-l-2 border-transparent px-4 py-3"
                    >
                        <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-16 rounded-full bg-muted" />
                            <div className="h-3 w-32 rounded bg-muted" />
                        </div>
                    </div>
                ))}
            </div>
            {/* Second skeleton group */}
            <div>
                <div className="flex items-center gap-2 px-4 py-2">
                    <div className="h-4 w-4 rounded bg-muted" />
                    <div className="h-4 w-20 rounded bg-muted" />
                </div>
                {[1, 2].map(i => (
                    <div
                        key={i}
                        className="border-l-2 border-transparent px-4 py-3"
                    >
                        <div className="mb-2 h-4 w-2/3 rounded bg-muted" />
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-16 rounded-full bg-muted" />
                            <div className="h-3 w-24 rounded bg-muted" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
