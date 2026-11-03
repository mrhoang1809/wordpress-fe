"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postsApi, categoriesApi, mediaApi } from "@/lib/api-client";
import { slugify, resolveMediaUrl } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import type { Post, Category, PaginatedResponse } from "@/types";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Upload,
  X,
  ImageIcon,
  Loader2,
  ExternalLink,
} from "lucide-react";

// ─── Extract HTML from blocks ─────────────────────────────────────────────────

function extractHtmlFromBlocks(post: Post): string {
  if (!post.blocks?.length) return "";
  const richBlock = post.blocks.find((b) => b.type === "RICH_TEXT");
  if (!richBlock) return "";
  // Try raw HTML field first, then prose JSON
  const data = richBlock.data as Record<string, unknown>;
  if (data._html && typeof data._html === "string") return data._html;
  // Fallback: serialise prose content nodes to plain paragraphs
  return "";
}

// ─── Featured Image Picker ────────────────────────────────────────────────────

function FeaturedImagePicker({
  value,
  onChange,
}: {
  value: { id: string; url: string } | null;
  onChange: (img: { id: string; url: string } | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const media = await mediaApi.upload(file, file.name);
      onChange({ id: media.id, url: media.url });
    } catch {
      alert("Upload thất bại.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
        <ImageIcon className="w-3.5 h-3.5 inline mr-1.5 text-brand-600" />
        Ảnh đại diện
      </label>

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveMediaUrl(value.url)}
            alt="Ảnh đại diện"
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg"
            >
              <Upload className="w-3.5 h-3.5" /> Đổi ảnh
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center gap-1.5 bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
            >
              <X className="w-3.5 h-3.5" /> Xóa
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-36 rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-400 bg-slate-50 hover:bg-brand-50 flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-300" />
              <span className="text-xs text-slate-500 font-medium">
                Nhấn để tải ảnh lên
              </span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Edit page ────────────────────────────────────────────────────────────────

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const qc = useQueryClient();
  const postId = params.id;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState<{
    id: string;
    url: string;
  } | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Load post
  const { data: post, isLoading } = useQuery<Post>({
    queryKey: ["post", postId],
    queryFn: () => postsApi.get(postId),
    enabled: !!postId,
  });

  // Load categories
  const { data: categoriesData } = useQuery<PaginatedResponse<Category>>({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
  });
  const categories = categoriesData?.data ?? [];

  // Hydrate form when post loads
  useEffect(() => {
    if (!post) return;
    setTitle(post.title ?? "");
    setSlug(post.slug ?? "");
    setExcerpt(post.excerpt ?? "");
    setContent(extractHtmlFromBlocks(post));
    setFeaturedImage(post.featuredImage ?? null);
    // Get category IDs from postCategories if available
    const catIds =
      (post as any).postCategories?.map((pc: any) => pc.categoryId) ?? [];
    setSelectedCategoryIds(catIds);
  }, [post]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!post) throw new Error("Post not loaded");
      // 1. Update metadata
      await postsApi.update(postId, {
        title,
        slug,
        excerpt: excerpt || undefined,
        featuredImageId: featuredImage?.id,
        categoryIds: selectedCategoryIds.length
          ? selectedCategoryIds
          : undefined,
      } as any);

      // 2. Sync content block
      if (content && content !== "<p></p>") {
        await postsApi.syncBlocks(postId, post.version, [
          {
            id: "block-1",
            type: "RICH_TEXT",
            order: 0,
            schemaVersion: 1,
            data: {
              schemaVersion: 1,
              _html: content,
            },
          },
        ]);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["post", postId] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err) =>
      setError(err instanceof ApiError ? err.message : "Lỗi khi lưu"),
  });

  const publishMutation = useMutation({
    mutationFn: () => postsApi.publish(postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["post", postId] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () => postsApi.unpublish(postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["post", postId] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const toggleCategory = (id: string) =>
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );

  const isPublished = post?.status === "PUBLISHED";

  if (isLoading) {
    return (
      <div className="p-8 flex items-center gap-3 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin" /> Đang tải bài viết...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/admin/posts")}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-black text-slate-900 truncate">
              {post?.title || "Chỉnh sửa bài viết"}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span
                className={`font-bold ${isPublished ? "text-green-600" : "text-amber-600"}`}
              >
                ● {isPublished ? "Đã đăng" : "Nháp"}
              </span>
              {post && (
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="flex items-center gap-1 hover:text-brand-600 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Xem
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {saved && (
            <span className="text-xs font-bold text-green-600">✓ Đã lưu</span>
          )}
          <button
            onClick={() => saveMutation.mutate()}
            disabled={!title || saveMutation.isPending}
            className="flex items-center gap-1.5 border border-slate-200 hover:border-brand-300 text-slate-700 hover:text-brand-700 text-sm font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Lưu
          </button>
          {isPublished ? (
            <button
              onClick={() => unpublishMutation.mutate()}
              disabled={unpublishMutation.isPending}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              <EyeOff className="w-3.5 h-3.5" /> Gỡ đăng
            </button>
          ) : (
            <button
              onClick={() => {
                saveMutation.mutate();
                setTimeout(() => publishMutation.mutate(), 300);
              }}
              disabled={!title || publishMutation.isPending}
              className="flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white text-sm font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              <Eye className="w-3.5 h-3.5" /> Đăng bài
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Left: content */}
          <div className="space-y-6">
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive font-medium">
                {error}
              </div>
            )}

            {/* Title */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                Tiêu đề <span className="text-accent-rose">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                placeholder="Tiêu đề bài viết..."
                className="w-full text-2xl font-black text-slate-900 placeholder-slate-300 border-none outline-none bg-transparent leading-tight"
              />
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <span className="text-xs text-slate-400">URL:</span>
                <span className="text-xs text-slate-500">/blog/</span>
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugTouched(true);
                  }}
                  className="text-xs text-brand-700 font-mono border-none outline-none bg-transparent flex-1"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                Mô tả ngắn (Excerpt)
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                placeholder="Tóm tắt ngắn gọn nội dung..."
                className="w-full text-sm text-slate-700 placeholder-slate-300 border-none outline-none resize-none bg-transparent leading-relaxed"
              />
              <p className="text-[11px] text-slate-400">
                {excerpt.length}/300 ký tự
              </p>
            </div>

            {/* Editor — only render after content loaded */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                Nội dung chi tiết
              </label>
              <TiptapEditor
                key={postId} // remount when post changes
                value={content}
                onChange={setContent}
                placeholder="Nội dung bài viết..."
                minHeight="min-h-[420px]"
              />
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <FeaturedImagePicker
                value={featuredImage}
                onChange={setFeaturedImage}
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                Danh mục
              </label>
              {categories.length === 0 ? (
                <p className="text-xs text-slate-400">Chưa có danh mục.</p>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="w-4 h-4 rounded accent-brand-700"
                      />
                      <span className="text-sm text-slate-700 group-hover:text-brand-700 transition-colors">
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
