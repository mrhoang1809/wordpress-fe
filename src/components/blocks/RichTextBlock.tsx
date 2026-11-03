import { RichTextBlockData } from '@/types';
import { spacingClass, cn } from '@/lib/utils';

interface Props {
  data: RichTextBlockData;
}

// Safely renders Tiptap JSON content as HTML
// In production, use @tiptap/html to generate HTML server-side
function renderTiptapJson(content: Record<string, unknown>): string {
  if (!content || content.type !== 'doc') return '';

  const nodes = content.content as Array<Record<string, unknown>> | undefined;
  if (!nodes) return '';

  return nodes.map(renderNode).join('');
}

function renderNode(node: Record<string, unknown>): string {
  const type = node.type as string;
  const content = node.content as Array<Record<string, unknown>> | undefined;
  const text = node.text as string | undefined;
  const marks = node.marks as Array<{ type: string }> | undefined;

  if (type === 'text') {
    let result = escapeHtml(text ?? '');
    if (marks) {
      for (const mark of marks) {
        if (mark.type === 'bold') result = `<strong>${result}</strong>`;
        if (mark.type === 'italic') result = `<em>${result}</em>`;
        if (mark.type === 'code') result = `<code>${result}</code>`;
      }
    }
    return result;
  }

  const inner = content ? content.map(renderNode).join('') : '';

  switch (type) {
    case 'paragraph': return `<p>${inner}</p>`;
    case 'heading': {
      const level = (node.attrs as { level?: number })?.level ?? 2;
      return `<h${level}>${inner}</h${level}>`;
    }
    case 'bulletList': return `<ul>${inner}</ul>`;
    case 'orderedList': return `<ol>${inner}</ol>`;
    case 'listItem': return `<li>${inner}</li>`;
    case 'blockquote': return `<blockquote>${inner}</blockquote>`;
    case 'codeBlock': return `<pre><code>${inner}</code></pre>`;
    case 'hardBreak': return '<br />';
    default: return inner;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const widthClass: Record<string, string> = {
  narrow: 'max-w-2xl',
  normal: 'max-w-4xl',
  wide: 'max-w-6xl',
  full: 'max-w-none',
};

export function RichTextBlock({ data }: Props) {
  const spacing = spacingClass(data.spacing);
  const width = widthClass[data.width ?? 'normal'];
  const alignment = data.alignment ?? 'left';

  const html = renderTiptapJson(data.content);

  return (
    <section className={cn(spacing, 'px-4 sm:px-6 lg:px-8')}>
      <div
        className={cn(
          'mx-auto prose prose-lg',
          width,
          alignment === 'center' && 'text-center',
          alignment === 'right' && 'text-right',
        )}
        // Content is rendered from our own Tiptap JSON, escaped properly above
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
