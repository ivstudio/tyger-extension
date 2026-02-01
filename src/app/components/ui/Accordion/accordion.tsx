import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/services/utils';

const Accordion = AccordionPrimitive.Root;

// Use explicit DOM types to avoid duplicate @types/react (Radix vs project) ReactNode mismatch
type AccordionItemProps = React.HTMLAttributes<HTMLDivElement> & {
    value: string;
};
type AccordionTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
type AccordionContentProps = React.HTMLAttributes<HTMLDivElement>;

const AccordionItemRoot = AccordionPrimitive.Item as React.ComponentType<
    AccordionItemProps & React.RefAttributes<HTMLDivElement>
>;
const AccordionHeaderRoot = AccordionPrimitive.Header as React.ComponentType<
    React.HTMLAttributes<HTMLHeadingElement> &
        React.RefAttributes<HTMLHeadingElement>
>;
const AccordionTriggerRoot = AccordionPrimitive.Trigger as React.ComponentType<
    AccordionTriggerProps & React.RefAttributes<HTMLButtonElement>
>;
const AccordionContentRoot = AccordionPrimitive.Content as React.ComponentType<
    AccordionContentProps & React.RefAttributes<HTMLDivElement>
>;

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
    ({ className, ...props }, ref) => (
        <AccordionItemRoot
            ref={ref}
            className={cn('border-b', className)}
            {...props}
        />
    )
);
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
    HTMLButtonElement,
    AccordionTriggerProps
>(({ className, children, ...props }, ref) => (
    <AccordionHeaderRoot className="flex">
        <AccordionTriggerRoot
            ref={ref}
            className={cn(
                'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
        </AccordionTriggerRoot>
    </AccordionHeaderRoot>
));
AccordionTrigger.displayName = 'AccordionTrigger';

const AccordionContent = React.forwardRef<
    HTMLDivElement,
    AccordionContentProps
>(({ className, children, ...props }, ref) => (
    <AccordionContentRoot
        ref={ref}
        className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm transition-all"
        {...props}
    >
        <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionContentRoot>
));

AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
