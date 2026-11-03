'use client';

import { HeroBlockData } from '@/types';
import { FormField } from './shared/FormField';
import { ButtonEditor } from './shared/ButtonEditor';

interface Props {
  data: HeroBlockData;
  onChange: (data: HeroBlockData) => void;
}

export function HeroForm({ data, onChange }: Props) {
  const update = (partial: Partial<HeroBlockData>) =>
    onChange({ ...data, ...partial });

  return (
    <div className="space-y-4">
      <FormField label="Eyebrow text" optional>
        <input
          className="form-input"
          value={data.eyebrow ?? ''}
          onChange={(e) => update({ eyebrow: e.target.value })}
          placeholder="e.g. Welcome"
        />
      </FormField>

      <FormField label="Title" required>
        <input
          className="form-input"
          value={data.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Main headline"
        />
      </FormField>

      <FormField label="Subtitle" optional>
        <input
          className="form-input"
          value={data.subtitle ?? ''}
          onChange={(e) => update({ subtitle: e.target.value })}
        />
      </FormField>

      <FormField label="Description" optional>
        <textarea
          className="form-input min-h-[80px]"
          value={data.description ?? ''}
          onChange={(e) => update({ description: e.target.value })}
        />
      </FormField>

      <FormField label="Image URL" optional>
        <input
          className="form-input"
          type="url"
          value={data.imageUrl ?? ''}
          onChange={(e) => update({ imageUrl: e.target.value })}
          placeholder="https://..."
        />
      </FormField>

      <FormField label="Image alt text" optional>
        <input
          className="form-input"
          value={data.imageAlt ?? ''}
          onChange={(e) => update({ imageAlt: e.target.value })}
        />
      </FormField>

      <FormField label="Layout">
        <select
          className="form-input"
          value={data.layout ?? 'image-right'}
          onChange={(e) => update({ layout: e.target.value as HeroBlockData['layout'] })}
        >
          <option value="image-right">Image Right</option>
          <option value="image-left">Image Left</option>
          <option value="image-top">Image Top</option>
          <option value="image-background">Image Background</option>
        </select>
      </FormField>

      <FormField label="Alignment">
        <select
          className="form-input"
          value={data.alignment ?? 'left'}
          onChange={(e) => update({ alignment: e.target.value as HeroBlockData['alignment'] })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </FormField>

      <FormField label="Theme">
        <select
          className="form-input"
          value={data.theme ?? 'light'}
          onChange={(e) => update({ theme: e.target.value as HeroBlockData['theme'] })}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </FormField>

      <FormField label="Spacing">
        <select
          className="form-input"
          value={data.spacing ?? 'lg'}
          onChange={(e) => update({ spacing: e.target.value as HeroBlockData['spacing'] })}
        >
          <option value="none">None</option>
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
          <option value="xl">Extra Large</option>
        </select>
      </FormField>

      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-2">Primary Button</p>
        <ButtonEditor
          value={data.primaryButton}
          onChange={(btn) => update({ primaryButton: btn })}
        />
      </div>

      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-2">Secondary Button</p>
        <ButtonEditor
          value={data.secondaryButton}
          onChange={(btn) => update({ secondaryButton: btn })}
        />
      </div>
    </div>
  );
}
