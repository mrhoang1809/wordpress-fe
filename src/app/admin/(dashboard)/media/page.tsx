'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaApi } from '@/lib/api-client';
import type { MediaItem, PaginatedResponse } from '@/types';
import { Upload, Trash2 } from 'lucide-react';

export default function MediaPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [altText, setAltText] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResponse<MediaItem>>({
    queryKey: ['media', page],
    queryFn: () => mediaApi.list({ page, pageSize: 24 }),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaApi.upload(file, altText),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['media'] }); setAltText(''); if (fileRef.current) fileRef.current.value = ''; },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mediaApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Thư viện</h1>

      {/* Upload */}
      <div className="mb-6 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-4">
          <div className="space-y-1 flex-1">
            <label className="text-xs font-medium text-muted-foreground">Mô tả ảnh (không bắt buộc)</label>
            <input className="form-input" value={altText} onChange={e => setAltText(e.target.value)} placeholder="Mô tả hình ảnh" />
          </div>
          <div className="pt-5">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="media-upload" />
            <label htmlFor="media-upload" className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer">
              <Upload className="h-4 w-4" /> Tải lên
            </label>
          </div>
        </div>
        {uploadMutation.isPending && <p className="mt-2 text-sm text-muted-foreground">Đang tải lên...</p>}
        {uploadMutation.isError && <p className="mt-2 text-sm text-destructive">Tải lên thất bại</p>}
      </div>

      {/* Grid */}
      {isLoading && <p className="text-muted-foreground">Đang tải...</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {data?.data?.map((item) => (
          <div key={item.id} className="rounded-lg border bg-card overflow-hidden group relative">
            <div className="aspect-square bg-muted flex items-center justify-center">
              <img src={item.url} alt={item.altText ?? ''} className="w-full h-full object-cover" />
            </div>
            <div className="p-2">
              <p className="text-xs text-muted-foreground truncate">{item.altText || item.url.split('/').pop()}</p>
              <p className="text-xs text-muted-foreground">{(item.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              onClick={() => { if (confirm('Xóa tệp này?')) deleteMutation.mutate(item.id); }}
              className="absolute top-2 right-2 p-1.5 rounded-md bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Trước</button>
          <span className="text-sm text-muted-foreground">Trang {page} / {data.meta.totalPages}</span>
          <button className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50" disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)}>Sau</button>
        </div>
      )}
    </div>
  );
}
