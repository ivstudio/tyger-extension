import { useState } from 'react';
import {
    ChecklistItem as ChecklistItemType,
    ChecklistItemStatus,
} from '@/types/checklist';
import { Button } from '../ui/Button';
import { Check, X, Minus, Circle } from 'lucide-react';
import { cn } from '@/services/utils';

interface ChecklistItemProps {
    item: ChecklistItemType;
    onStatusChange: (
        itemId: string,
        status: ChecklistItemStatus,
        notes?: string
    ) => void;
    onClick?: () => void;
}

export function ChecklistItem({
    item,
    onStatusChange,
    onClick,
}: ChecklistItemProps) {
    const [notes, setNotes] = useState(item.notes || '');
    const [showNotes, setShowNotes] = useState(false);

    const handleStatusClick = (status: ChecklistItemStatus) => {
        onStatusChange(item.id, status, notes);
    };

    const handleNotesChange = (value: string) => {
        setNotes(value);
        onStatusChange(item.id, item.status, value);
    };

    const getStatusIcon = (status: ChecklistItemStatus) => {
        switch (status) {
            case 'pass':
                return <Check className="h-4 w-4" />;
            case 'fail':
                return <X className="h-4 w-4" />;
            case 'skip':
                return <Minus className="h-4 w-4" />;
            case 'pending':
                return <Circle className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: ChecklistItemStatus) => {
        switch (status) {
            case 'pass':
                return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200';
            case 'fail':
                return 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200';
            case 'skip':
                return 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200';
            case 'pending':
                return 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
        }
    };

    return (
        <div className="border-b border-border py-3 last:border-0">
            <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                    <div
                        className={cn(
                            'flex-1',
                            onClick && 'cursor-pointer hover:text-blue-600'
                        )}
                        onClick={onClick}
                    >
                        <h4 className="text-sm font-medium">{item.title}</h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {item.description}
                        </p>
                    </div>
                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                'h-8 w-8 p-0',
                                item.status === 'pass' && getStatusColor('pass')
                            )}
                            onClick={() => handleStatusClick('pass')}
                            title="Pass"
                        >
                            {getStatusIcon('pass')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                'h-8 w-8 p-0',
                                item.status === 'fail' && getStatusColor('fail')
                            )}
                            onClick={() => handleStatusClick('fail')}
                            title="Fail"
                        >
                            {getStatusIcon('fail')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                'h-8 w-8 p-0',
                                item.status === 'skip' && getStatusColor('skip')
                            )}
                            onClick={() => handleStatusClick('skip')}
                            title="Skip"
                        >
                            {getStatusIcon('skip')}
                        </Button>
                    </div>
                </div>

                {item.status !== 'pending' && (
                    <div className="space-y-2">
                        <button
                            className="text-xs text-blue-600 hover:underline"
                            onClick={() => setShowNotes(!showNotes)}
                        >
                            {showNotes ? 'Hide notes' : 'Add notes'}
                        </button>
                        {showNotes && (
                            <textarea
                                className="min-h-[60px] w-full rounded border border-border px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Add notes about this check..."
                                value={notes}
                                onChange={e =>
                                    handleNotesChange(e.target.value)
                                }
                            />
                        )}
                        {!showNotes && notes && (
                            <p className="text-xs text-muted-foreground italic">
                                Note: {notes}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
