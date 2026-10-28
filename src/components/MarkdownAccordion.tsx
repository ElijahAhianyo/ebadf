import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface MarkdownAccordionProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  defaultOpen?: boolean;
  readMore?: boolean;
}

export const MarkdownAccordion: React.FC<MarkdownAccordionProps> = ({
  children,
  title = 'Details',
  defaultOpen = false,
  readMore = false,
}) => {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? 'item-1' : undefined}
      className={readMore
        ? "article-read-more not-prose my-6 overflow-hidden rounded-xl border border-border bg-muted/20 shadow-sm"
        : "my-6 border rounded-lg"}
    >
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger className={readMore
          ? "gap-4 px-5 py-5 text-base hover:no-underline hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&>svg]:text-muted-foreground"
          : "px-4 hover:no-underline hover:bg-muted/50 rounded-t-lg"}>
          <span className="font-semibold text-left">{title}</span>
        </AccordionTrigger>
        <AccordionContent className={readMore ? "px-5 pb-5" : "px-4 pb-4"}>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {children}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
