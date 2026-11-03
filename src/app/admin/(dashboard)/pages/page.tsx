'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePages, useDeletePage, usePublishPage, useUnpublishPage, useDuplicatePage } from '@/features/page-builder/hooks/usePages';
import type { ContentStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import { Plus, Search, Copy, Eye, Trash2, EyeOff, Pencil, BookOpen } from 'lucide-react';

const STATUS_COLORS: Record<ContentStatus, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-600',
};

export default function PagesListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const params: Record<string, string | number> = { page, pageSize: 20 };
  if (search) params.search = search;
  if (statusFilter) params.status = statusFilter;

  const { data, isLoading } = usePages(params);
  const deleteMutation = useDeletePage();
  const publishMutation = usePublishPage();
  const unpublishMutation = useUnpublishPage();
  const duplicateMutation = useDuplicatePage();

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setDeleteTarget(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Trang</h1>
        <Link
          href="/admin/pages/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Trang mới
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="form-input pl-9"
            placeholder="Tìm trang..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="form-input w-40"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="DRAFT">Nháp</option>
          <option value="PUBLISHED">Đã xuất bản</option>
          <option value="ARCHIVED">Lưu trữ</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Tiêu đề</th>
              <th className="text-left px-4 py-3 font-medium">Đường dẫn</th>
              <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium">Tác giả</th>
              <th className="text-left px-4 py-3 font-medium">Xuất bản</th>
              <th className="text-left px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Đang tải...</td></tr>
            )}
            {!isLoading && (data?.data ?? []).length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Chưa có trang nào.</td></tr>
            )}
            {data?.data?.map((page) => (
              <tr key={page.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link href={`/admin/pages/${page.id}/edit`} className="font-medium hover:underline">
                    {page.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">/{page.slug}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[page.status]}`}>
                    {page.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {page.createdBy ? `${page.createdBy.firstName} ${page.createdBy.lastName}` : '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(page.publishedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/pages/${page.id}/edit`}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Sửa"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => duplicateMutation.mutate(page.id)}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Nhân bản"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <a
                      href={`/${page.slug}`}
                      target="_blank"
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Xem"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    {page.status === 'PUBLISHED' ? (
                      <button
                        onClick={() => unpublishMutation.mutate(page.id)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Gỡ xuất bản"
                      >
                        <EyeOff className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => publishMutation.mutate(page.id)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Xuất bản"
                      >
                        <BookOpen className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget(page.id)}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Trang {data.meta.page} / {data.meta.totalPages} ({data.meta.total} tổng)
          </p>
          <div className="flex gap-2">
            <button
              className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Trước
            </button>
            <button
              className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteTarget(null)}>
          <div className="rounded-lg bg-card p-6 shadow-lg max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">Xóa trang này?</h2>
            <p className="text-sm text-muted-foreground mb-4">Thao tác này không thể hoàn tác.</p>
            <div className="flex justify-end gap-2">
              <button className="rounded-md border px-4 py-2 text-sm" onClick={() => setDeleteTarget(null)}>Hủy</button>
              <button
                className="rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground"
                onClick={() => handleDelete(deleteTarget)}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
