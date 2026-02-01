import { ChecklistCategory as ChecklistCategoryType, ChecklistItemStatus } from '@/types/checklist';
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

export function ChecklistCategory({ category, onItemStatusChange }: ChecklistCategoryProps) {
    const totalItems = category.items.length;
    const completedItems = category.items.filter(item => item.status !== 'pending').length;
    const passedItems = category.items.filter(item => item.status === 'pass').length;
    const failedItems = category.items.filter(item => item.status === 'fail').length;

    const completionPercentage = Math.round((completedItems / totalItems) * 100);

    return (
        <AccordionItem value={category.id}>
            <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between flex-1 pr-2">
                    <div className="flex flex-col items-start">
                        <span className="font-medium">{category.title}</span>
                        <span className="text-xs text-muted-foreground font-normal">
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
                            <Badge variant="default" className="text-xs bg-green-600">
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
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>Progress</span>
                                <span>{completionPercentage}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-300"
                                    style={{ width: `${completionPercentage}%` }}
                                />
                            </div>
                        </div>
                    )}
                    {category.items.map(item => (
                        <ChecklistItem
                            key={item.id}
                            item={item}
                            onStatusChange={(itemId, status, notes) =>
                                onItemStatusChange(category.id, itemId, status, notes)
                            }
                        />
                    ))}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
