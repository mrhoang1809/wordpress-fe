'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, Copy, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageBlock } from '@/types';
import { BLOCK_REGISTRY } from '@/features/page-builder/registry/block-registry';

interface Props {
  block: PageBlock;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function BlockCard({
  block,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const meta = BLOCK_REGISTRY[block.type as keyof typeof BLOCK_REGISTRY]?.meta;
  const title = (block.data as Record<string, unknown>).title as string | undefined;
  const summary = title || meta?.name || block.type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border bg-card transition-shadow',
        isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:shadow-sm',
        isDragging && 'opacity-50 shadow-lg',
      )}
    >
      <div className="flex items-center gap-2 p-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Block info */}
        <button
          onClick={onSelect}
          className="flex-1 flex items-center gap-2 text-left"
        >
          <span className="inline-flex rounded bg-muted px-2 py-0.5 text-xs font-medium">
            {meta?.name ?? block.type}
          </span>
          <span className="text-sm truncate">{summary}</span>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 rounded hover:bg-muted disabled:opacity-30"
            title="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 rounded hover:bg-muted disabled:opacity-30"
            title="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            onClick={onToggleExpand}
            className="p-1 rounded hover:bg-muted"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={onDuplicate}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Nhân bản"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            title="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
