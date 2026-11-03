'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreatePage } from '@/features/page-builder/hooks/usePages';
import { slugify } from '@/lib/utils';
import { ApiError } from '@/lib/api-client';

export default function NewPagePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreatePage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const page = await createMutation.mutateAsync({
        title,
        slug: slug || slugify(title),
      });
      router.push(`/admin/pages/${page.id}/edit`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể tạo trang');
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Trang mới</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Tiêu đề</label>
          <input
            className="form-input"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="About Us"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Đường dẫn</label>
          <input
            className="form-input"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
            placeholder="about-us"
          />
          <p className="text-xs text-muted-foreground">URL: /{slug || slugify(title) || '...'}</p>
        </div>
        {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Đang tạo...' : 'Tạo trang'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
