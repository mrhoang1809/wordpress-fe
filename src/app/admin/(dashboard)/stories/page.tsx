"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth.store";
import type { PaginatedResponse, Post, ContentStatus } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Eye,
  BookOpen,
  EyeOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STATUS_COLORS: Record<ContentStatus, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800",
  PUBLISHED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-gray-100 text-gray-600",
};
const STATUS_LABELS: Record<ContentStatus, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã đăng",
  ARCHIVED: "Lưu trữ",
};

const CATEGORY_SLUG = "truyen-cam-hung";

export default function StoriesAdminPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const params = useMemo<Record<string, string | number>>(() => {
    const p: Record<string, string | number> = {
      page,
      pageSize: 10,
      categorySlug: CATEGORY_SLUG,
    };
    if (search) p.search = search;
    if (statusFilter) p.status = statusFilter;
    return p;
  }, [page, search, statusFilter]);

  const { data, isLoading, isError, error, refetch } = useQuery<
    PaginatedResponse<Post>
  >({
    queryKey: ["stories-posts", user?.id, page, search, statusFilter],
    queryFn: () => postsApi.list(params),
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ["stories-posts"] });

  const publishMutation = useMutation({
    mutationFn: (id: string) => postsApi.publish(id),
    onSuccess: inv,
  });
  const unpublishMutation = useMutation({
    mutationFn: (id: string) => postsApi.unpublish(id),
    onSuccess: inv,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess: () => {
      inv();
      setDeleteTarget(null);
    },
  });

  const posts = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-brand-950">
            Câu Chuyện Truyền Cảm Hứng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hiển thị ở{" "}
            <code className="bg-slate-100 px-1 rounded text-xs">/stories</code>{" "}
            và block trang chủ. Bài viết cần có danh mục{" "}
            <strong>truyen-cam-hung</strong>.
          </p>
        </div>
        <Link
          href={`/admin/posts/new?category=${CATEGORY_SLUG}`}
          className="flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 px-4 py-2.5 text-sm font-bold text-white transition-colors"
        >
          <Plus className="h-4 w-4" /> Thêm Câu Chuyện
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          className="form-input max-w-xs"
          placeholder="Tìm câu chuyện..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="form-input w-44"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="DRAFT">Nháp</option>
          <option value="PUBLISHED">Đã đăng</option>
        </select>
        {(search || statusFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setPage(1);
            }}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 px-2"
          >
            ✕ Xóa lọc
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wide">
                Tiêu đề
              </th>
              <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wide">
                Slug
              </th>
              <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wide">
                Trạng thái
              </th>
              <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wide">
                Ngày đăng
              </th>
              <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wide">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  <div className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    Đang tải...
                  </div>
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <p className="text-sm text-red-600 mb-2">
                    {error instanceof Error ? error.message : "Lỗi tải dữ liệu"}
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="text-xs font-bold text-brand-700 underline"
                  >
                    Thử lại
                  </button>
                </td>
              </tr>
            )}
            {!isLoading && !isError && posts.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-16 text-center text-slate-400"
                >
                  <p className="text-3xl mb-2">❤️</p>
                  <p className="font-medium">Chưa có câu chuyện nào.</p>
                  <p className="text-xs mt-1">
                    Nhấn &ldquo;Thêm Câu Chuyện&rdquo; và chọn danh mục{" "}
                    <strong>truyen-cam-hung</strong>.
                  </p>
                </td>
              </tr>
            )}
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-800 max-w-xs truncate">
                  {post.title}
                </td>
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                  /blog/{post.slug}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_COLORS[post.status]}`}
                  >
                    {STATUS_LABELS[post.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {formatDate(post.publishedAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      title="Xem"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </a>
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      title="Sửa"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    {post.status === "PUBLISHED" ? (
                      <button
                        onClick={() => unpublishMutation.mutate(post.id)}
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
                        title="Gỡ đăng"
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => publishMutation.mutate(post.id)}
                        className="p-1.5 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors"
                        title="Đăng"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget(post.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 text-sm text-slate-500">
          <span>
            Trang <strong>{meta.page}</strong> / {totalPages} · {meta.total} câu
            chuyện
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-brand-300 disabled:opacity-40 text-xs font-bold"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Trước
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const n = start + i;
              if (n > totalPages) return null;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${n === page ? "bg-brand-700 text-white" : "border border-slate-200 hover:border-brand-300 text-slate-600"}`}
                >
                  {n}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-brand-300 disabled:opacity-40 text-xs font-bold"
            >
              Tiếp <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="rounded-2xl bg-white p-6 shadow-2xl max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-black mb-2">Xóa câu chuyện này?</h2>
            <p className="text-sm text-slate-500 mb-5">
              Thao tác này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="rounded-xl border px-4 py-2 text-sm font-bold"
                onClick={() => setDeleteTarget(null)}
              >
                Hủy
              </button>
              <button
                className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-bold text-white"
                onClick={() => deleteMutation.mutate(deleteTarget)}
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
