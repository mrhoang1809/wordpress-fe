'use client';

import { FaqBlockData, FaqItem } from '@/types';
import { FormField } from './shared/FormField';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface Props {
  data: FaqBlockData;
  onChange: (data: FaqBlockData) => void;
}

function generateId(): string {
  return `faq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function FaqForm({ data, onChange }: Props) {
  const update = (partial: Partial<FaqBlockData>) => onChange({ ...data, ...partial });

  const addItem = () => {
    update({
      items: [...data.items, { id: generateId(), question: '', answer: '' }],
    });
  };

  const removeItem = (id: string) => {
    update({ items: data.items.filter((i) => i.id !== id) });
  };

  const updateItem = (id: string, partial: Partial<FaqItem>) => {
    update({
      items: data.items.map((i) => (i.id === id ? { ...i, ...partial } : i)),
    });
  };

  return (
    <div className="space-y-4">
      <FormField label="Section title" optional>
        <input className="form-input" value={data.title ?? ''} onChange={(e) => update({ title: e.target.value })} placeholder="FAQ" />
      </FormField>

      <FormField label="Section description" optional>
        <textarea className="form-input" value={data.description ?? ''} onChange={(e) => update({ description: e.target.value })} />
      </FormField>

      <FormField label="Display style">
        <select className="form-input" value={data.displayStyle ?? 'accordion'} onChange={(e) => update({ displayStyle: e.target.value as FaqBlockData['displayStyle'] })}>
          <option value="accordion">Accordion</option>
          <option value="list">Plain list</option>
        </select>
      </FormField>

      {data.displayStyle === 'accordion' && (
        <div className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            id="allow-multiple"
            checked={data.allowMultipleOpen ?? false}
            onChange={(e) => update({ allowMultipleOpen: e.target.checked })}
          />
          <label htmlFor="allow-multiple">Allow multiple items open</label>
        </div>
      )}

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">FAQ Items ({data.items.length})</p>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Plus className="h-3 w-3" /> Add item
          </button>
        </div>

        {data.items.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No items yet. Add at least one.</p>
        )}

        <div className="space-y-3">
          {data.items.map((item, index) => (
            <div key={item.id} className="rounded-md border p-3 bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-xs font-medium">Item {index + 1}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-destructive hover:text-destructive/80"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <input
                  className="form-input"
                  placeholder="Question"
                  value={item.question}
                  onChange={(e) => updateItem(item.id, { question: e.target.value })}
                />
                <textarea
                  className="form-input min-h-[60px]"
                  placeholder="Answer"
                  value={item.answer}
                  onChange={(e) => updateItem(item.id, { answer: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
