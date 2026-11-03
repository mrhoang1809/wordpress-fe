'use client';

import { RichTextBlockData } from '@/types';
import { FormField } from './shared/FormField';

interface Props {
  data: RichTextBlockData;
  onChange: (data: RichTextBlockData) => void;
}

/**
 * Simplified rich text editor.
 * In production, replace the textarea with a Tiptap editor instance.
 * The textarea here edits the plain-text content inside the first paragraph node.
 */
export function RichTextForm({ data, onChange }: Props) {
  const update = (partial: Partial<RichTextBlockData>) => onChange({ ...data, ...partial });

  // Extract plain text from Tiptap JSON for editing
  const getPlainText = (): string => {
    try {
      const doc = data.content as { content?: Array<{ content?: Array<{ text?: string }> }> };
      return (
        doc?.content
          ?.flatMap((node) => node.content ?? [])
          .map((n) => n.text ?? '')
          .join('\n') ?? ''
      );
    } catch {
      return '';
    }
  };

  const setPlainText = (text: string) => {
    const paragraphs = text.split('\n').map((line) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: line }],
    }));
    update({ content: { type: 'doc', content: paragraphs } });
  };

  return (
    <div className="space-y-4">
      <FormField label="Content" required>
        <textarea
          className="form-input min-h-[160px] font-mono text-sm"
          value={getPlainText()}
          onChange={(e) => setPlainText(e.target.value)}
          placeholder="Enter your content here. Each line becomes a paragraph."
        />
        <p className="text-xs text-muted-foreground mt-1">
          Note: Full rich text editing (Tiptap) is available in the extended implementation.
        </p>
      </FormField>

      <FormField label="Alignment">
        <select className="form-input" value={data.alignment ?? 'left'} onChange={(e) => update({ alignment: e.target.value as RichTextBlockData['alignment'] })}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </FormField>

      <FormField label="Width">
        <select className="form-input" value={data.width ?? 'normal'} onChange={(e) => update({ width: e.target.value as RichTextBlockData['width'] })}>
          <option value="narrow">Narrow</option>
          <option value="normal">Normal</option>
          <option value="wide">Wide</option>
          <option value="full">Full</option>
        </select>
      </FormField>

      <FormField label="Spacing">
        <select className="form-input" value={data.spacing ?? 'md'} onChange={(e) => update({ spacing: e.target.value as RichTextBlockData['spacing'] })}>
          <option value="none">None</option>
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
          <option value="xl">Extra Large</option>
        </select>
      </FormField>
    </div>
  );
}
