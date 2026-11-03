import { PageBlock } from '@/types';
import { BLOCK_REGISTRY } from '@/features/page-builder/registry/block-registry';

interface Props {
  blocks: PageBlock[];
}

/**
 * Renders an ordered list of blocks using the static block registry.
 * Unknown block types render a safe null fallback.
 * Admin controls never appear here — this is the public renderer.
 */
export function BlockRenderer({ blocks }: Props) {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <>
      {sorted.map((block) => {
        const entry = BLOCK_REGISTRY[block.type as keyof typeof BLOCK_REGISTRY];
        if (!entry) {
          // Safe fallback for unknown block types — no crash, no render
          return null;
        }
        const Renderer = entry.publicRenderer as React.ComponentType<{ data: unknown }>;
        return <Renderer key={block.id} data={block.data} />;
      })}
    </>
  );
}
