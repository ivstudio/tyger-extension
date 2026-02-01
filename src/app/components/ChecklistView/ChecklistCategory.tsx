import {
    ChecklistCategory as ChecklistCategoryType,
    ChecklistItemStatus,
} from '@/types/checklist';
import {
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '../ui/Accordion';
import { ChecklistItem } from './ChecklistItem';
import { Badge } from '../ui/Badge';

interface ChecklistCategoryProps {
    category: ChecklistCategoryType;
    onItemStatusChange: (
        categoryId: string,
        itemId: string,
        status: ChecklistItemStatus,
        notes?: string
    ) => void;
}

export function ChecklistCategory({
    category,
    onItemStatusChange,
}: ChecklistCategoryProps) {
    const totalItems = category.items.length;
    const completedItems = category.items.filter(
        item => item.status !== 'pending'
    ).length;
    const passedItems = category.items.filter(
        item => item.status === 'pass'
    ).length;
    const failedItems = category.items.filter(
        item => item.status === 'fail'
    ).length;

    const completionPercentage = Math.round(
        (completedItems / totalItems) * 100
    );

    return (
        <AccordionItem value={category.id}>
            <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-1 items-center justify-between pr-2">
                    <div className="flex flex-col items-start">
                        <span className="font-medium">{category.title}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                            {category.description}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {failedItems > 0 && (
                            <Badge variant="destructive" className="text-xs">
                                {failedItems} failed
                            </Badge>
                        )}
                        {passedItems > 0 && (
                            <Badge
                                variant="default"
                                className="bg-green-600 text-xs"
                            >
                                {passedItems} passed
                            </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                            {completedItems}/{totalItems}
                        </Badge>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="space-y-0 px-2">
                    {completedItems > 0 && (
                        <div className="mb-4">
                            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span>{completionPercentage}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-300"
                                    style={{
                                        width: `${completionPercentage}%`,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    {category.items.map(item => (
                        <ChecklistItem
                            key={item.id}
                            item={item}
                            onStatusChange={(itemId, status, notes) =>
                                onItemStatusChange(
                                    category.id,
                                    itemId,
                                    status,
                                    notes
                                )
                            }
                        />
                    ))}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
