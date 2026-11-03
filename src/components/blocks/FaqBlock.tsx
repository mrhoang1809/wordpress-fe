'use client';

import { useState } from 'react';
import { FaqBlockData } from '@/types';
import { spacingClass, cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface Props {
  data: FaqBlockData;
}

export function FaqBlock({ data }: Props) {
  const spacing = spacingClass(data.spacing);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!data.allowMultipleOpen) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  if (data.displayStyle === 'list') {
    return (
      <section className={cn(spacing, 'px-4 sm:px-6 lg:px-8')}>
        <div className="mx-auto max-w-4xl">
          {(data.title || data.description) && (
            <div className="mb-8 text-center">
              {data.title && <h2 className="text-3xl font-bold">{data.title}</h2>}
              {data.description && <p className="mt-2 text-lg text-muted-foreground">{data.description}</p>}
            </div>
          )}
          <dl className="space-y-6">
            {data.items.map((item) => (
              <div key={item.id} className="border-b pb-6">
                <dt className="text-lg font-semibold">{item.question}</dt>
                <dd className="mt-2 text-muted-foreground">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    );
  }

  // Accordion (default)
  return (
    <section className={cn(spacing, 'px-4 sm:px-6 lg:px-8')}>
      <div className="mx-auto max-w-4xl">
        {(data.title || data.description) && (
          <div className="mb-8 text-center">
            {data.title && <h2 className="text-3xl font-bold">{data.title}</h2>}
            {data.description && <p className="mt-2 text-lg text-muted-foreground">{data.description}</p>}
          </div>
        )}
        <dl className="space-y-2">
          {data.items.map((item) => {
            const isOpen = openItems.has(item.id);
            return (
              <div key={item.id} className="border rounded-lg overflow-hidden">
                <dt>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-6 py-4 text-left font-medium hover:bg-muted/50 transition-colors"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${item.id}`}
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={cn('h-4 w-4 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')}
                      aria-hidden="true"
                    />
                  </button>
                </dt>
                <dd
                  id={`faq-${item.id}`}
                  role="region"
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    isOpen ? 'max-h-96' : 'max-h-0',
                  )}
                >
                  <p className="px-6 pb-4 text-muted-foreground">{item.answer}</p>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
