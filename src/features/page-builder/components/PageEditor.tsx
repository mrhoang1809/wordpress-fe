'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useRouter } from 'next/navigation';
import type { Page, PageBlock, BlockType } from '@/types';
import { usePage, usePageBlocks, useUpdatePage, useSyncBlocks, usePublishPage, useUnpublishPage } from '../hooks/usePages';
import { BLOCK_REGISTRY } from '../registry/block-registry';
import { slugify, cn } from '@/lib/utils';
import { ApiError } from '@/lib/api-client';
import { BlockCard } from './BlockCard';
import { BlockLibrary } from './BlockLibrary';
import { BlockSettingsPanel } from './BlockSettingsPanel';
import { Save, Eye, BookOpen, EyeOff, Plus, AlertTriangle } from 'lucide-react';

interface Props {
  pageId: string;
}

function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function PageEditor({ pageId }: Props) {
  const router = useRouter();
  const { data: page, isLoading: pageLoading } = usePage(pageId);
  const { data: serverBlocks } = usePageBlocks(pageId);

  const updateMutation = useUpdatePage(pageId);
  const syncMutation = useSyncBlocks(pageId);
  const publishMutation = usePublishPage();
  const unpublishMutation = useUnpublishPage();

  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showBlockLibrary, setShowBlockLibrary] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const isInitialLoad = useRef(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Initialize state from server data
  useEffect(() => {
    if (page && isInitialLoad.current) {
      setTitle(page.title);
      setSlug(page.slug);
      setExcerpt(page.excerpt ?? '');
      setSeoTitle(page.seoTitle ?? '');
      setSeoDescription(page.seoDescription ?? '');
      isInitialLoad.current = false;
    }
  }, [page]);

  useEffect(() => {
    if (serverBlocks) {
      setBlocks(serverBlocks.map(b => ({ ...b, data: b.data as Record<string, unknown> })));
    }
  }, [serverBlocks]);

  // Track unsaved changes
  const checkChanges = useCallback(() => {
    if (!page) return false;
    const metaChanged =
      title !== page.title ||
      slug !== page.slug ||
      excerpt !== (page.excerpt ?? '') ||
      seoTitle !== (page.seoTitle ?? '') ||
      seoDescription !== (page.seoDescription ?? '');

    const blocksChanged = serverBlocks
      ? blocks.length !== serverBlocks.length ||
        blocks.some((b, i) => {
          const sb = serverBlocks[i];
          return !sb || b.order !== sb.order || JSON.stringify(b.data) !== JSON.stringify(sb.data) || b.type !== sb.type;
        })
      : blocks.length > 0;

    return metaChanged || blocksChanged;
  }, [page, title, slug, excerpt, seoTitle, seoDescription, blocks, serverBlocks]);

  useEffect(() => {
    setHasChanges(checkChanges());
  }, [checkChanges]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges]);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId) ?? null;

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setBlocks(items => {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      return reordered.map((b, i) => ({ ...b, order: i }));
    });
  };

  const handleAddBlock = (type: BlockType) => {
    const entry = BLOCK_REGISTRY[type];
    const newBlock: PageBlock = {
      id: generateBlockId(),
      type,
      order: blocks.length,
      schemaVersion: 1,
      data: { ...entry.defaultData },
    };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    setExpandedBlocks(prev => new Set(prev).add(newBlock.id));
    setShowBlockLibrary(false);
  };

  const handleBlockDataChange = (id: string, data: Record<string, unknown>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, data } : b));
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(prev => {
      const filtered = prev.filter(b => b.id !== id);
      return filtered.map((b, i) => ({ ...b, order: i }));
    });
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const handleDuplicateBlock = (id: string) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      const original = prev[idx];
      const copy: PageBlock = {
        ...original,
        id: generateBlockId(),
        data: { ...original.data },
        order: idx + 1,
      };
      const updated = [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)];
      return updated.map((b, i) => ({ ...b, order: i }));
    });
  };

  const handleMoveUp = (id: string) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx <= 0) return prev;
      const reordered = arrayMove(prev, idx, idx - 1);
      return reordered.map((b, i) => ({ ...b, order: i }));
    });
  };

  const handleMoveDown = (id: string) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const reordered = arrayMove(prev, idx, idx + 1);
      return reordered.map((b, i) => ({ ...b, order: i }));
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedBlocks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setError(null);
    try {
      // Save page metadata if changed
      if (page) {
        const metaChanged = title !== page.title || slug !== page.slug ||
          excerpt !== (page.excerpt ?? '') || seoTitle !== (page.seoTitle ?? '') ||
          seoDescription !== (page.seoDescription ?? '');
        if (metaChanged) {
          await updateMutation.mutateAsync({
            title, slug, excerpt, seoTitle, seoDescription,
          } as Partial<Page>);
        }
      }
      // Sync blocks
      if (page) {
        await syncMutation.mutateAsync({ version: page.version, blocks });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save');
    }
  };

  const handlePublish = async () => {
    setError(null);
    try {
      // Save first, then publish
      await handleSave();
      await publishMutation.mutateAsync(pageId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to publish');
    }
  };

  const handleUnpublish = async () => {
    setError(null);
    try {
      await unpublishMutation.mutateAsync(pageId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to unpublish');
    }
  };

  if (pageLoading || !page) {
    return <div className="flex items-center justify-center p-8"><p className="text-muted-foreground">Loading page...</p></div>;
  }

  const isSaving = syncMutation.isPending || updateMutation.isPending;
  const isPublishing = publishMutation.isPending;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b px-6 py-3 bg-card">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">{page.title}</h1>
          {hasChanges && (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <AlertTriangle className="h-3 w-3" /> Unsaved changes
            </span>
          )}
          <span className={cn(
            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
            page.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
            page.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-600'
          )}>
            {page.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/${page.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            <Eye className="h-4 w-4" /> Xem trước
          </a>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
          </button>
          {page.status === 'PUBLISHED' ? (
            <button
              onClick={handleUnpublish}
              disabled={isPublishing}
              className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
            >
              <EyeOff className="h-4 w-4" /> Gỡ xuất bản
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <BookOpen className="h-4 w-4" /> {isPublishing ? 'Đang xuất bản...' : 'Xuất bản'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Blocks list */}
        <div className="flex-1 overflow-auto p-6">
          {/* Page metadata */}
          <div className="mb-6 rounded-lg border bg-card p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Slug</label>
                <input className="form-input" value={slug} onChange={e => setSlug(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Excerpt</label>
              <textarea className="form-input min-h-[60px]" value={excerpt} onChange={e => setExcerpt(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">SEO Title</label>
                <input className="form-input" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">SEO Description</label>
                <input className="form-input" value={seoDescription} onChange={e => setSeoDescription(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Blocks */}
          <div className="space-y-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                {blocks.map((block, index) => (
                  <BlockCard
                    key={block.id}
                    block={block}
                    isSelected={selectedBlockId === block.id}
                    isExpanded={expandedBlocks.has(block.id)}
                    onSelect={() => setSelectedBlockId(block.id)}
                    onToggleExpand={() => toggleExpand(block.id)}
                    onDuplicate={() => handleDuplicateBlock(block.id)}
                    onDelete={() => handleDeleteBlock(block.id)}
                    onMoveUp={() => handleMoveUp(block.id)}
                    onMoveDown={() => handleMoveDown(block.id)}
                    isFirst={index === 0}
                    isLast={index === blocks.length - 1}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* Add block button */}
            <button
              onClick={() => setShowBlockLibrary(!showBlockLibrary)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-4 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Block
            </button>

            {showBlockLibrary && (
              <div className="mt-3">
                <BlockLibrary onAdd={handleAddBlock} />
              </div>
            )}

            {blocks.length === 0 && !showBlockLibrary && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No blocks yet. Click &ldquo;Add Block&rdquo; to start building your page.
              </p>
            )}
          </div>
        </div>

        {/* Right: Settings panel */}
        <div className="w-96 shrink-0 border-l overflow-auto p-4 bg-muted/20">
          {selectedBlock ? (
            <BlockSettingsPanel
              block={selectedBlock}
              onChange={(data) => handleBlockDataChange(selectedBlock.id, data)}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center mt-8">
              Select a block to edit its settings.
            </p>
          )}
        </div>
      </div>

      {/* Leave warning */}
      {showLeaveWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-card p-6 shadow-lg max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Leave this page?</h2>
            <p className="text-sm text-muted-foreground mb-4">You have unsaved changes that will be lost.</p>
            <div className="flex justify-end gap-2">
              <button className="rounded-md border px-4 py-2 text-sm" onClick={() => setShowLeaveWarning(false)}>Stay</button>
              <button className="rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground" onClick={() => router.back()}>Leave</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
