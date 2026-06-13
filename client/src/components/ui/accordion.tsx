import * as React from 'react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Accordion as AccordionPrimitive } from 'radix-ui';

import { cn } from '../../lib/utils';
import { Button } from './button';

type Props = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function ApplicationAccordion({ title, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="w-full border border-border rounded-lg overflow-hidden bg-white/40">
      <Button
        onClick={() => setOpen((v) => !v)}
        className="
          w-full max-w-full
          flex items-center justify-between
          gap-3
          px-4 py-3 sm:px-5 sm:py-4
          text-sm font-medium text-green-800
          hover:bg-surface-muted transition-colors
          min-h-11
        "
      >
        <span className="flex-1 text-left leading-snug wrap-break-words min-w-0">{title}</span>

        <span className="shrink-0">
          {open ? (
            <ChevronUp className="w-4 h-4 text-tx-caption" />
          ) : (
            <ChevronDown className="w-4 h-4 text-tx-caption" />
          )}
        </span>
      </Button>

      {open && (
        <div className="border-t border-border px-4 py-3 sm:px-5 sm:py-4 w-full">{children}</div>
      )}
    </div>
  );
}

function Accordion({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn('flex w-full flex-col', className)}
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('not-last:border-b', className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div
        className={cn(
          'h-(--radix-accordion-content-height) pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
