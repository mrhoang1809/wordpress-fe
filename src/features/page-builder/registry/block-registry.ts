/**
 * Block Registry
 *
 * Statically maps block type identifiers to:
 * - publicRenderer: used by BlockRenderer on the public website
 * - editorForm: used by BlockSettingsPanel in the admin editor
 * - meta: name, icon, description for the block library panel
 * - defaultData: initial data when a new block is added
 *
 * RULE: Never import renderers or forms from dynamic DB values.
 * All entries must be statically registered here at build time.
 */

import { HeroBlock } from '@/components/blocks/HeroBlock';
import { BannerBlock } from '@/components/blocks/BannerBlock';
import { RichTextBlock } from '@/components/blocks/RichTextBlock';
import { ImageBlock } from '@/components/blocks/ImageBlock';
import { CtaBlock } from '@/components/blocks/CtaBlock';
import { FaqBlock } from '@/components/blocks/FaqBlock';
import type { BlockType } from '@/types';

// Editor forms are lazy-imported at the call site to keep public bundle lean.
// We export the form component directly here for use in the admin.
import { HeroForm } from '@/features/page-builder/components/forms/HeroForm';
import { BannerForm } from '@/features/page-builder/components/forms/BannerForm';
import { RichTextForm } from '@/features/page-builder/components/forms/RichTextForm';
import { ImageForm } from '@/features/page-builder/components/forms/ImageForm';
import { CtaForm } from '@/features/page-builder/components/forms/CtaForm';
import { FaqForm } from '@/features/page-builder/components/forms/FaqForm';

export interface BlockRegistryEntry {
  type: BlockType;
  meta: {
    name: string;
    description: string;
    icon: string; // Lucide icon name
  };
  publicRenderer: React.ComponentType<{ data: any }>;
  editorForm: React.ComponentType<{ data: any; onChange: (data: any) => void }>;
  defaultData: Record<string, unknown>;
}

export const BLOCK_REGISTRY: Record<BlockType, BlockRegistryEntry> = {
  HERO: {
    type: 'HERO',
    meta: {
      name: 'Hero',
      description: 'Full-width introductory section with headline and call to action.',
      icon: 'Layers',
    },
    publicRenderer: HeroBlock,
    editorForm: HeroForm,
    defaultData: {
      schemaVersion: 1,
      title: 'Welcome to our website',
      subtitle: 'Subtitle goes here',
      description: 'Add a description to make this hero section more compelling.',
      layout: 'image-right',
      alignment: 'left',
      theme: 'light',
      spacing: 'lg',
    },
  },
  BANNER: {
    type: 'BANNER',
    meta: {
      name: 'Banner',
      description: 'Promotional or announcement banner with optional image background.',
      icon: 'Megaphone',
    },
    publicRenderer: BannerBlock,
    editorForm: BannerForm,
    defaultData: {
      schemaVersion: 1,
      title: 'Special Announcement',
      description: 'Add your announcement or promotional message here.',
      backgroundType: 'color',
      backgroundColor: '#1e40af',
      textColor: '#ffffff',
      alignment: 'center',
      spacing: 'md',
    },
  },
  RICH_TEXT: {
    type: 'RICH_TEXT',
    meta: {
      name: 'Rich Text',
      description: 'Formatted editorial content with headings, lists, and links.',
      icon: 'FileText',
    },
    publicRenderer: RichTextBlock,
    editorForm: RichTextForm,
    defaultData: {
      schemaVersion: 1,
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Start writing your content here...' }],
          },
        ],
      },
      alignment: 'left',
      width: 'normal',
      spacing: 'md',
    },
  },
  IMAGE: {
    type: 'IMAGE',
    meta: {
      name: 'Image',
      description: 'Standalone image with optional caption and link.',
      icon: 'Image',
    },
    publicRenderer: ImageBlock,
    editorForm: ImageForm,
    defaultData: {
      schemaVersion: 1,
      imageUrl: '',
      alt: '',
      aspectRatio: '16/9',
      objectFit: 'cover',
      alignment: 'center',
      width: 'normal',
      spacing: 'md',
    },
  },
  CTA: {
    type: 'CTA',
    meta: {
      name: 'Call to Action',
      description: 'Conversion-focused section with headline, description, and buttons.',
      icon: 'Zap',
    },
    publicRenderer: CtaBlock,
    editorForm: CtaForm,
    defaultData: {
      schemaVersion: 1,
      title: 'Ready to get started?',
      description: 'Join thousands of customers who love our product.',
      primaryButton: { label: 'Get Started', url: '/signup' },
      layout: 'stacked',
      theme: 'brand',
      spacing: 'xl',
    },
  },
  FAQ: {
    type: 'FAQ',
    meta: {
      name: 'FAQ',
      description: 'Frequently asked questions in an accessible accordion layout.',
      icon: 'HelpCircle',
    },
    publicRenderer: FaqBlock,
    editorForm: FaqForm,
    defaultData: {
      schemaVersion: 1,
      title: 'Frequently Asked Questions',
      items: [
        {
          id: 'faq-default-1',
          question: 'What is your product?',
          answer: 'Add your answer here.',
        },
      ],
      displayStyle: 'accordion',
      allowMultipleOpen: false,
      spacing: 'lg',
    },
  },
};

export const BLOCK_TYPES = Object.values(BLOCK_REGISTRY);
