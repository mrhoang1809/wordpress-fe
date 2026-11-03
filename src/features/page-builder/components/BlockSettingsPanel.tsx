'use client';

import { BLOCK_REGISTRY } from '@/features/page-builder/registry/block-registry';
import type { PageBlock } from '@/types';

interface Props {
  block: PageBlock;
  onChange: (data: Record<string, unknown>) => void;
}

export function BlockSettingsPanel({ block, onChange }: Props) {
  const entry = BLOCK_REGISTRY[block.type as keyof typeof BLOCK_REGISTRY];
  if (!entry) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Unknown block type: {block.type}
      </div>
    );
  }

  const Form = entry.editorForm;
  const data = block.data as Record<string, unknown> & { schemaVersion: number };

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold mb-3 pb-2 border-b">
        Configure: {entry.meta.name}
      </h3>
      <Form
        data={data as never}
        onChange={(newData: Record<string, unknown>) => onChange(newData)}
      />
    </div>
  );
}
