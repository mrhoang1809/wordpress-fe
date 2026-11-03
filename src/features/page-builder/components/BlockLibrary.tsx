'use client';

import { BLOCK_TYPES } from '@/features/page-builder/registry/block-registry';
import * as LucideIcons from 'lucide-react';
import type { BlockType } from '@/types';

interface Props {
  onAdd: (type: BlockType) => void;
}

export function BlockLibrary({ onAdd }: Props) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold mb-3">Add Block</h3>
      <div className="grid gap-2">
        {BLOCK_TYPES.map(({ type, meta }) => {
          const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[meta.icon] ?? LucideIcons.Square;
          return (
            <button
              key={type}
              onClick={() => onAdd(type)}
              className="flex items-start gap-3 rounded-md border p-3 text-left hover:bg-muted/50 transition-colors"
            >
              <Icon className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">{meta.name}</p>
                <p className="text-xs text-muted-foreground">{meta.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
