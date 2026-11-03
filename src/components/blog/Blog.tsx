"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { PublicPostCard, PaginatedResponse, Category } from "@/types";
import { formatDate } from "@/lib/utils";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { BASE_URL } from "@/lib/api-client";

// ─── Category slug → display label ───────────────────────────────────────────

function slugToLabel(slug: string, categories: Category[]): string {
  const map: Record<string, string> = {
    "dinh-duong": "Dinh Dưỡng & Eat Clean",
    "bai-tap": "Bài Tập 30 Phút",
    "suc-khoe": "Sức Khỏe & Thể Trạng",
    "truyen-cam-hung": "Truyền Cảm Hứng",
  };
  return map[slug] ?? categories.find((c) => c.slug === slug)?.name ?? slug;
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: PublicPostCard }) {
  const category = post.categories[0];
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-brand-100/60 hover:border-brand-300/60 shadow-sm hover:shadow-[0_12px_40px_rgba(147,51,234,0.12)] transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative h-52 bg-gradient-to-br from-brand-100 to-brand-50 overflow-hidden">
        {post.featuredImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.featuredImage.url}
            alt={post.featuredImage.altText ?? post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 via-brand-50 to-white">
            <span className="text-4xl opacity-40">📝</span>
          </div>
        )}
        {category && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-brand-700 to-accent-magenta text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {category.name}
          </span>
        )}
        {/* Gradient overlay for dark bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        <h3 className="font-black text-brand-950 text-[15px] leading-tight line-clamp-2 group-hover:text-brand-700 transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-3 border-t border-slate-100">
          <span>
            {post.author
              ? `${post.author.firstName} ${post.author.lastName}`
              : "Curves Vietnam"}
          </span>
          <span>{formatDate(post.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export interface BlogProps {
  initialData: PaginatedResponse<PublicPostCard>;
  categories: Category[];
  initialCategory?: string;
  initialSearch?: string;
}

export function Blog({
  initialData,
  categories,
  initialCategory = "",
  initialSearch = "",
}: BlogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PublicPostCard[]>(initialData.data);
  const [page, setPage] = useState(initialData.meta.page);
  const [hasMore, setHasMore] = useState(page < initialData.meta.totalPages);
  const [search, setSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const categoriesOnly = categories.filter((c) => !c.parentId && c.isActive);
  const TABS = [
    { slug: "", label: "Tất Cả" },
    ...categoriesOnly.slice(0, 5).map((c) => ({
      slug: c.slug,
      label: slugToLabel(c.slug, categoriesOnly),
    })),
  ];

  const { observed: isIntersecting } = useIntersectionObserver(
    bottomRef as React.RefObject<HTMLDivElement | null>,
    { root: null, rootMargin: "200px", threshold: 0 },
  );

  function navigate(params: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) =>
      v ? next.set(k, v) : next.delete(k),
    );
    router.push(`/blog?${next.toString()}`);
  }

  const loadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const qs = new URLSearchParams({
        page: String(page + 1),
        pageSize: "12",
      });
      // Default to tin-tuc when no category filter
      qs.set("categorySlug", activeCategory || "tin-tuc");
      if (search) qs.set("search", search);
      const res = await fetch(`${BASE_URL}/public/posts?${qs.toString()}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData((prev) => [...prev, ...(json.data as PublicPostCard[])]);
      setPage((p) => p + 1);
      setHasMore(page + 1 < json.meta.totalPages);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadFirstPage = async ({
    nextSearch = "",
    nextCategory = "",
  }: {
    nextSearch?: string;
    nextCategory?: string;
  }) => {
    const qs = new URLSearchParams({ page: "1", pageSize: "12" });
    // Default to tin-tuc when no category filter
    qs.set("categorySlug", nextCategory || "tin-tuc");
    if (nextSearch) qs.set("search", nextSearch);

    const res = await fetch(`${BASE_URL}/public/posts?${qs.toString()}`);
    if (!res.ok) throw new Error("Không thể tải bài viết");
    const json = (await res.json()) as PaginatedResponse<PublicPostCard>;
    setData(json.data);
    setPage(json.meta.page);
    setHasMore(json.meta.page < json.meta.totalPages);
  };

  useEffect(() => {
    if (!isIntersecting) return;
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIntersecting]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextSearch = search.trim();
    setIsSearching(true);
    setActiveCategory("");
    try {
      await loadFirstPage({ nextSearch });
      navigate({ search: nextSearch, category: "", page: "1" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategory = async (slug: string) => {
    setActiveCategory(slug);
    setSearch("");
    setIsSearching(true);
    try {
      await loadFirstPage({ nextCategory: slug });
      navigate({ category: slug, search: "", page: "1" });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="bg-mesh-gradient text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden noise-overlay">
        {/* Glow orbs */}
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-accent-magenta/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-10 left-1/4 w-72 h-72 bg-brand-600/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-5 text-center">
          <span className="section-eyebrow">
            Curves Daily Women&apos;s Journal
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05]">
            Blog Sức Khỏe &amp;
            <br />
            <span className="gradient-text">Vóc Dáng Phái Đẹp</span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto text-[15px] leading-relaxed">
            Mẹo giảm mỡ · Thực đơn Eat Clean · Tập luyện 30 phút · Câu chuyện
            truyền cảm hứng từ cộng đồng Curves.
          </p>

          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="pt-4 max-w-lg mx-auto flex gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm bài viết... (Eat clean, Giảm mỡ đùi...)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-white/40 text-slate-900 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-accent-magenta/60 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-3 bg-accent-magenta/80 hover:bg-accent-magenta border border-accent-magenta/40 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 shrink-0"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Tìm"
              )}
            </button>
          </form>
        </div>
      </section>

      {/* ── Category tabs ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-brand-100 sticky top-[68px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto py-3">
          <div className="flex items-center gap-2 min-w-max">
            {TABS.map((tab) => {
              const active = tab.slug === activeCategory;
              return (
                <button
                  key={tab.slug}
                  onClick={() => handleCategory(tab.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    active
                      ? "bg-gradient-to-r from-brand-700 to-accent-magenta text-white shadow-glow-purple"
                      : "bg-brand-50 text-slate-600 hover:bg-brand-100 hover:text-brand-800"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Posts grid ────────────────────────────────────────────────── */}
      <section className="py-14 bg-slate-50 min-h-[600px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {data.length === 0 && !isLoadingMore ? (
            <div className="text-center py-24 text-slate-400">
              <p className="text-5xl mb-4">🔍</p>
              <p className="font-bold text-lg">
                Không tìm thấy bài viết phù hợp.
              </p>
              <p className="text-sm mt-1">
                Hãy thử từ khóa khác hoặc chọn danh mục khác.
              </p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
              {data.map((post) => (
                <div key={post.id} className="break-inside-avoid mb-6">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}

          {isLoadingMore && (
            <div className="flex justify-center py-12">
              <div className="flex items-center gap-3 text-brand-600 font-semibold text-sm">
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang tải thêm...
              </div>
            </div>
          )}

          <div ref={bottomRef} className="h-8" />

          {!hasMore && data.length > 0 && (
            <div className="text-center pt-8 pb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                — Bạn đã xem hết tất cả —
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
