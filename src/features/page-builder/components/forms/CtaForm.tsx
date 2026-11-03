'use client';

import { CtaBlockData } from '@/types';
import { FormField } from './shared/FormField';
import { ButtonEditor } from './shared/ButtonEditor';

interface Props {
  data: CtaBlockData;
  onChange: (data: CtaBlockData) => void;
}

export function CtaForm({ data, onChange }: Props) {
  const update = (partial: Partial<CtaBlockData>) => onChange({ ...data, ...partial });

  return (
    <div className="space-y-4">
      <FormField label="Title" required>
        <input className="form-input" value={data.title} onChange={(e) => update({ title: e.target.value })} />
      </FormField>

      <FormField label="Description" optional>
        <textarea className="form-input min-h-[80px]" value={data.description ?? ''} onChange={(e) => update({ description: e.target.value })} />
      </FormField>

      <FormField label="Layout">
        <select className="form-input" value={data.layout ?? 'stacked'} onChange={(e) => update({ layout: e.target.value as CtaBlockData['layout'] })}>
          <option value="stacked">Stacked</option>
          <option value="inline">Inline</option>
        </select>
      </FormField>

      <FormField label="Theme">
        <select className="form-input" value={data.theme ?? 'brand'} onChange={(e) => update({ theme: e.target.value as CtaBlockData['theme'] })}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="brand">Brand</option>
        </select>
      </FormField>

      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-2">Primary Button</p>
        <ButtonEditor value={data.primaryButton} onChange={(btn) => update({ primaryButton: btn })} />
      </div>

      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-2">Secondary Button</p>
        <ButtonEditor value={data.secondaryButton} onChange={(btn) => update({ secondaryButton: btn })} />
      </div>
    </div>
  );
}
