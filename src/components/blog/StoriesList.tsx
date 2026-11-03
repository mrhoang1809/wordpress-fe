"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Loader2, Quote, ArrowRight, Search } from "lucide-react";
import type { PublicPostCard } from "@/types";
import { formatDate } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { BASE_URL } from "@/lib/api-client";

// ─── Story Card ───────────────────────────────────────────────────────────────

function StoryCard({ post }: { post: PublicPostCard }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-brand-100/60 hover:border-brand-300/60 shadow-sm hover:shadow-[0_12px_40px_rgba(147,51,234,0.14)] transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-brand-100 to-brand-50">
        {post.featuredImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.featuredImage.url}
            alt={post.featuredImage.altText ?? post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-accent-magenta/10">
            <span className="text-5xl opacity-30">❤️</span>
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 to-transparent" />

        {/* Quote badge */}
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Quote className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white/80 text-[10px] font-bold uppercase tracking-wider">
            Câu chuyện
          </span>
        </div>

        {/* Stars */}
        <div className="absolute bottom-3 right-4 flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-accent-gold text-xs">
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        <h3 className="font-black text-brand-950 text-[15px] leading-tight line-clamp-2 group-hover:text-brand-700 transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-slate-500 text-xs leading-relaxed italic line-clamp-3">
            &ldquo;{post.excerpt}&rdquo;
          </p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium">
            {post.author
              ? `${post.author.firstName} ${post.author.lastName}`
              : "Curves Vietnam"}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-brand-600 group-hover:gap-1.5 transition-all">
            Đọc thêm <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── StoriesList ─────────────────────────────────────────────────────────────

export function StoriesList({
  initialData,
}: {
  initialData: {
    data: PublicPostCard[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
  };
}) {
  const [data, setData] = useState<PublicPostCard[]>(initialData.data);
  const [page, setPage] = useState(initialData.meta.page);
  const [hasMore, setHasMore] = useState(page < initialData.meta.totalPages);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { observed: isIntersecting } = useIntersectionObserver(
    bottomRef as React.RefObject<HTMLDivElement | null>,
    { root: null, rootMargin: "200px", threshold: 0 },
  );

  const loadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const qs = new URLSearchParams({
        page: String(page + 1),
        pageSize: "12",
        categorySlug: "truyen-cam-hung",
      });
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

  useEffect(() => {
    if (!isIntersecting) return;
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIntersecting]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextSearch = search.trim();
    setIsSearching(true);
    try {
      const qs = new URLSearchParams({
        page: "1",
        pageSize: "12",
        categorySlug: "truyen-cam-hung",
      });
      if (nextSearch) qs.set("search", nextSearch);
      const res = await fetch(`${BASE_URL}/public/posts?${qs.toString()}`);
      if (!res.ok) throw new Error("Không thể tải câu chuyện");
      const json = await res.json();
      setData(json.data as PublicPostCard[]);
      setPage(json.meta.page as number);
      setHasMore(json.meta.page < json.meta.totalPages);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="py-14 bg-slate-50 min-h-[600px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto mb-8 flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm câu chuyện..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-500 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-magenta/60"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-3 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tìm"}
          </button>
        </form>
        {data.length === 0 && !isLoadingMore && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">❤️</p>
            <p className="text-slate-500 font-bold text-lg">
              Chưa có câu chuyện nào.
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Hãy quay lại sau bạn nhé!
            </p>
          </div>
        )}

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
          {data.map((post) => (
            <div key={post.id} className="break-inside-avoid mb-6">
              <StoryCard post={post} />
            </div>
          ))}
        </div>

        {isLoadingMore && (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-2.5 text-brand-600 font-semibold text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang tải thêm câu chuyện...
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-8" />

        {!hasMore && data.length > 0 && (
          <div className="text-center pt-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              — Bạn đã xem hết tất cả câu chuyện —
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
