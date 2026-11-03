"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postsApi, categoriesApi, mediaApi } from "@/lib/api-client";
import { slugify, resolveMediaUrl } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { Suspense } from "react";
import type { Category, PaginatedResponse } from "@/types";
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  X,
  ImageIcon,
  Loader2,
  EyeIcon,
} from "lucide-react";

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
      alert("Upload thất bại, vui lòng thử lại.");
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
              <span className="text-[10px] text-slate-400">
                PNG, JPG, WEBP · Tối đa 5MB
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

// ─── Preview Modal ────────────────────────────────────────────────────────────

function PreviewModal({
  title,
  excerpt,
  content,
  featuredImageUrl,
  onClose,
}: {
  title: string;
  excerpt: string;
  content: string;
  featuredImageUrl?: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <EyeIcon className="w-3.5 h-3.5" />
            <span className="font-bold">Xem trước bài viết</span>
            <span className="text-slate-300">·</span>
            <span>Bố cục thực tế khi đăng lên</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Article preview */}
        <div className="p-6 sm:p-10">
          {/* Featured image */}
          {featuredImageUrl && (
            <div className="rounded-2xl overflow-hidden mb-8 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveMediaUrl(featuredImageUrl)}
                alt={title}
                className="w-full h-64 sm:h-80 object-cover"
              />
            </div>
          )}

          {/* Title */}
          {title ? (
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight mb-4">
              {title}
            </h1>
          ) : (
            <p className="text-slate-400 italic mb-4">Chưa có tiêu đề...</p>
          )}

          {/* Excerpt */}
          {excerpt && (
            <p className="text-slate-500 text-base leading-relaxed mb-8 border-l-4 border-brand-400 pl-4 italic">
              {excerpt}
            </p>
          )}

          {/* Content */}
          {content && content !== "<p></p>" ? (
            <div
              className="prose prose-slate max-w-none text-slate-700 leading-relaxed
                [&_h1]:text-2xl [&_h1]:font-black [&_h1]:mt-8 [&_h1]:mb-4
                [&_h2]:text-xl [&_h2]:font-black [&_h2]:mt-6 [&_h2]:mb-3
                [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2
                [&_p]:mb-4 [&_p]:leading-relaxed
                [&_ul]:my-4 [&_ul]:pl-6 [&_li]:mb-2
                [&_ol]:my-4 [&_ol]:pl-6
                [&_blockquote]:border-l-4 [&_blockquote]:border-brand-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-500 [&_blockquote]:my-6
                [&_img]:rounded-xl [&_img]:shadow-sm [&_img]:my-6 [&_img]:max-w-full
                [&_a]:text-brand-600 [&_a]:underline [&_a]:underline-offset-2
                [&_hr]:my-8 [&_hr]:border-slate-200
                [&_strong]:font-bold [&_em]:italic"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-slate-400 italic">Chưa có nội dung...</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function NewPostPageWrapper() {
  return (
    <Suspense
      fallback={<div className="p-8 text-muted-foreground">Đang tải...</div>}
    >
      <NewPostPage />
    </Suspense>
  );
}

function NewPostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();

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
  const [publishNow, setPublishNow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const { data: categoriesData } = useQuery<PaginatedResponse<Category>>({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
  });
  const categories = categoriesData?.data ?? [];

  // Auto-select category from URL param (e.g. ?category=truyen-cam-hung)
  useEffect(() => {
    const catSlug = searchParams.get("category");
    if (!catSlug || !categories.length) return;
    const cat = categories.find((c) => c.slug === catSlug);
    if (cat && !selectedCategoryIds.includes(cat.id)) {
      setSelectedCategoryIds([cat.id]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, searchParams]);

  const doSave = async (publish: boolean) => {
    const finalSlug = slug || slugify(title);

    // Xác định categoryIds để gán
    let categoryIds = selectedCategoryIds.length
      ? selectedCategoryIds
      : undefined;

    if (!categoryIds) {
      // Thử tìm trong cache trước
      let tinTucCat = categories.find((c) => c.slug === "tin-tuc");

      // Nếu categories chưa load — fetch trực tiếp
      if (!tinTucCat) {
        try {
          const freshCats = await categoriesApi.list();
          tinTucCat = freshCats.data.find((c) => c.slug === "tin-tuc");
        } catch {
          /* ignore, bài viết vẫn được tạo, chỉ không có category */
        }
      }

      if (tinTucCat) categoryIds = [tinTucCat.id];
    }

    const post = await postsApi.create({
      title,
      slug: finalSlug,
      excerpt: excerpt || undefined,
      featuredImageId: featuredImage?.id,
      categoryIds,
    } as any);

    if (content && content !== "<p></p>") {
      await postsApi.syncBlocks(post.id, post.version, [
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

    if (publish) {
      await postsApi.publish(post.id);
    }

    return post;
  };

  const saveMutation = useMutation({
    mutationFn: (publish: boolean) => doSave(publish),
    onSuccess: () => {
      // Invalidate + redirect — list sẽ tự refetch khi mount
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      router.push("/admin/posts");
    },
    onError: (err) => {
      setError(
        err instanceof ApiError ? err.message : "Không thể tạo bài viết",
      );
    },
  });

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const saving = saveMutation.isPending;

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        {/* ── Top bar ─────────────────────────────────────────────── */}
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/posts")}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-black text-slate-900">
                Bài Viết Mới
              </h1>
              <p className="text-xs text-slate-500">
                Soạn bài viết · đăng lên mục Tin Tức (/blog)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Preview */}
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              disabled={!title && !content}
              className="flex items-center gap-1.5 border border-slate-200 hover:border-brand-300 text-slate-600 hover:text-brand-700 text-sm font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-40"
            >
              <EyeIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xem trước</span>
            </button>

            {/* Save draft */}
            <button
              onClick={() => saveMutation.mutate(false)}
              disabled={!title || saving}
              className="flex items-center gap-1.5 border border-slate-200 hover:border-brand-300 text-slate-700 hover:text-brand-700 text-sm font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Lưu nháp</span>
            </button>

            {/* Publish */}
            <button
              onClick={() => saveMutation.mutate(true)}
              disabled={!title || saving}
              className="flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
              Đăng Bài
            </button>
          </div>
        </div>

        {/* ── Body ──────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            {/* Left */}
            <div className="space-y-6">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}

              {/* Title + slug */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Tiêu đề <span className="text-red-400">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                  placeholder="Nhập tiêu đề bài viết..."
                  lang="vi"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full text-2xl font-black text-slate-900 placeholder-slate-300 border-none outline-none bg-transparent leading-tight"
                />
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <span className="text-xs text-slate-400 shrink-0">
                    URL: /blog/
                  </span>
                  <input
                    value={slug || slugify(title)}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugTouched(true);
                    }}
                    placeholder={slugify(title) || "duong-dan"}
                    className="text-xs text-brand-700 font-mono border-none outline-none bg-transparent flex-1 min-w-0"
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
                  placeholder="Tóm tắt ngắn gọn, hiển thị trong danh sách blog..."
                  className="w-full text-sm text-slate-700 placeholder-slate-300 border-none outline-none resize-none bg-transparent leading-relaxed"
                />
                <p className="text-[11px] text-slate-400">
                  {excerpt.length}/300 ký tự
                </p>
              </div>

              {/* Editor */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Nội dung chi tiết
                </label>
                <TiptapEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Bắt đầu viết nội dung bài viết..."
                  minHeight="min-h-[420px]"
                />
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-5">
              {/* Featured image */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <FeaturedImagePicker
                  value={featuredImage}
                  onChange={setFeaturedImage}
                />
              </div>

              {/* Categories */}
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

              {/* Publish card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                  Xuất bản
                </p>
                <div className="space-y-1.5 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Ảnh đại diện</span>
                    <span
                      className={
                        featuredImage
                          ? "text-green-600 font-bold"
                          : "text-slate-400"
                      }
                    >
                      {featuredImage ? "✓ Đã chọn" : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Danh mục</span>
                    <span
                      className={
                        selectedCategoryIds.length
                          ? "text-green-600 font-bold"
                          : "text-slate-400"
                      }
                    >
                      {selectedCategoryIds.length
                        ? `${selectedCategoryIds.length}`
                        : "—"}
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    onClick={() => saveMutation.mutate(false)}
                    disabled={!title || saving}
                    className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-brand-300 text-sm font-bold text-slate-700 hover:text-brand-700 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" /> Lưu nháp
                  </button>
                  <button
                    type="button"
                    onClick={() => saveMutation.mutate(true)}
                    disabled={!title || saving}
                    className="w-full flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white text-sm font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Eye className="w-3.5 h-3.5" /> Đăng Bài
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <PreviewModal
          title={title}
          excerpt={excerpt}
          content={content}
          featuredImageUrl={featuredImage?.url}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
