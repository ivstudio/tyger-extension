import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Check } from 'lucide-react';

interface ScanningStateProps {
    currentUrl: string | null;
    onAnimationComplete: () => void;
}

const SCAN_STEPS = [
    'Analyzing DOM structure...',
    'Checking color contrast...',
    'Validating ARIA labels...',
    'Testing keyboard navigation...',
    'Verifying WCAG compliance...',
] as const;

const ANIMATION_DURATION = 4000; // 4 seconds total
const STEP_DURATION = ANIMATION_DURATION / SCAN_STEPS.length; // 800ms per step
const PROGRESS_INTERVAL = 50; // Update progress every 50ms

export default function ScanningState({
    currentUrl,
    onAnimationComplete,
}: ScanningStateProps) {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(
        new Set()
    );

    const getDisplayUrl = useCallback((url: string | null) => {
        if (!url) return 'Unknown page';
        try {
            const urlObj = new URL(url);
            return urlObj.origin;
        } catch {
            return url;
        }
    }, []);

    useEffect(() => {
        let elapsed = 0;

        const interval = setInterval(() => {
            elapsed += PROGRESS_INTERVAL;
            const newProgress = Math.min(
                (elapsed / ANIMATION_DURATION) * 100,
                100
            );
            setProgress(newProgress);

            // Calculate which step should be active based on elapsed time
            const stepIndex = Math.min(
                Math.floor(elapsed / STEP_DURATION),
                SCAN_STEPS.length - 1
            );

            // Mark previous steps as completed
            if (stepIndex > 0) {
                setCompletedSteps(prev => {
                    const newSet = new Set(prev);
                    for (let i = 0; i < stepIndex; i++) {
                        newSet.add(i);
                    }
                    return newSet;
                });
            }

            setCurrentStep(stepIndex);

            // Animation complete
            if (elapsed >= ANIMATION_DURATION) {
                clearInterval(interval);
                // Mark all steps as completed
                setCompletedSteps(new Set(SCAN_STEPS.map((_, i) => i)));
                setProgress(100);
                // Small delay before transitioning to results
                setTimeout(onAnimationComplete, 300);
            }
        }, PROGRESS_INTERVAL);

        return () => clearInterval(interval);
    }, [onAnimationComplete]);

    const getStepIcon = (index: number) => {
        if (completedSteps.has(index)) {
            return (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                    <Check className="h-4 w-4 text-white" />
                </div>
            );
        }
        if (index === currentStep) {
            return (
                <div className="flex h-6 w-6 items-center justify-center">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-primary" />
                </div>
            );
        }
        return (
            <div className="flex h-6 w-6 items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-muted" />
            </div>
        );
    };

    return (
        <div className="flex h-full w-full flex-col">
            {/* Main content area */}
            <div className="flex-1 overflow-y-auto px-8 pt-12 pb-24">
                <div className="flex flex-col items-center text-center">
                    {/* Animated shield icon with spinning border */}
                    <div className="relative mb-5">
                        <div className="animate-spin-slow absolute inset-0 h-16 w-16 rounded-2xl border-2 border-dashed border-primary" />
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                            <ShieldCheck className="h-8 w-8 text-primary-foreground" />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="mb-2 text-2xl font-bold text-foreground">
                        Scanning Page
                    </h2>

                    {/* URL */}
                    <p className="mb-8 text-sm text-muted-foreground">
                        {getDisplayUrl(currentUrl)}
                    </p>

                    {/* Progress section */}
                    <div className="mb-8 w-full">
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Progress
                            </span>
                            <span className="font-medium text-foreground">
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-100 ease-linear"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Verification steps */}
                    <div className="w-full space-y-2">
                        {SCAN_STEPS.map((step, index) => (
                            <div
                                key={step}
                                className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-300 ${
                                    completedSteps.has(index)
                                        ? 'border-green-200 bg-green-50'
                                        : index === currentStep
                                          ? 'border-primary/30 bg-primary/5'
                                          : 'border-border bg-background'
                                }`}
                            >
                                {getStepIcon(index)}
                                <span
                                    className={`text-sm ${
                                        completedSteps.has(index)
                                            ? 'text-green-700'
                                            : index === currentStep
                                              ? 'text-foreground'
                                              : 'text-muted-foreground'
                                    }`}
                                >
                                    {step}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fixed bottom section */}
            <div className="fixed right-0 bottom-0 left-0 border-t border-border bg-background px-8 py-4">
                <p className="text-center text-sm text-muted-foreground">
                    Analyzing accessibility issues...
                </p>
            </div>
        </div>
    );
}
