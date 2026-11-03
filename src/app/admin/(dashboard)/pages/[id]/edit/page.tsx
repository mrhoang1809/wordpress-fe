'use client';

import { use } from 'react';
import { PageEditor } from '@/features/page-builder/components/PageEditor';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditPage({ params }: Props) {
  const { id } = use(params);
  return <PageEditor pageId={id} />;
}
