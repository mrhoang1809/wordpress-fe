"use client";

import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api-client";
import type { PublicPostCard } from "@/types";
import { useRouter } from "next/navigation";
import { useTrialModal } from "./TrialRegistrationModal";
import { DEMO_STORIES } from "@/lib/demo-content";
import { ArrowRight, Quote } from "lucide-react";

export function SuccessStoriesSection() {
  const router = useRouter();
  const { open } = useTrialModal();

  const { data } = useQuery<{
    data: PublicPostCard[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
  }>({
    queryKey: ["public-stories"],
    queryFn: () =>
      publicApi.listPosts({
        page: 1,
        pageSize: 3,
        categorySlug: "truyen-cam-hung",
      }),
    staleTime: 600_000,
    retry: false,
    placeholderData: {
      data: DEMO_STORIES,
      meta: {
        total: DEMO_STORIES.length,
        page: 1,
        pageSize: 100,
        totalPages: 1,
      },
    },
  });

  const stories = data?.data?.length ? data.data : DEMO_STORIES;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle bg pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,_rgba(147,51,234,0.04)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3">
            <span className="section-eyebrow">✨ Chuyện Thật Người Thật</span>
            <h2 className="text-4xl sm:text-5xl font-black text-brand-950 leading-[1.05] tracking-tight">
              Hành Trình
              <br />
              <span className="bg-gradient-to-r from-brand-700 to-accent-magenta bg-clip-text text-transparent">
                Thay Đổi Cuộc Sống
              </span>
            </h2>
            <p className="text-slate-500 max-w-md text-[15px] leading-relaxed">
              Hàng ngàn phụ nữ Việt Nam đã lấy lại vóc dáng thon gọn và sức khỏe
              dẻo dai nhờ Curves.
            </p>
          </div>

          <button
            onClick={() => router.push("/stories")}
            className="flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-900 group transition-colors shrink-0"
          >
            Xem tất cả câu chuyện
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* ── Cards ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stories.slice(0, 3).map((s, i) => (
            <article
              key={s.id}
              onClick={() => router.push(`/blog/${s.slug}`)}
              className="group relative bg-gradient-to-b from-brand-50 to-white rounded-3xl overflow-hidden border border-brand-100 hover:border-brand-300 shadow-sm hover:shadow-[0_12px_40px_rgba(147,51,234,0.15)] transition-all duration-300 cursor-pointer"
            >
              {/* Avatar / image strip */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand-200 via-brand-100 to-accent-magenta/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    s.featuredImage?.url ||
                    `https://images.unsplash.com/photo-154400531374${i}-3a6f7c93f54d?auto=format&fit=crop&w=600&q=75`
                  }
                  alt={s.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 to-transparent" />

                {/* Quote icon */}
                <div className="absolute bottom-4 left-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Quote className="w-4 h-4 text-white" />
                </div>

                {/* Star rating */}
                <div className="absolute bottom-4 right-4 flex gap-0.5">
                  {[...Array(5)].map((_, k) => (
                    <span key={k} className="text-accent-gold text-xs">
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-3">
                <h3 className="font-black text-brand-950 text-[15px] leading-tight group-hover:text-brand-700 transition-colors line-clamp-2">
                  {s.title}
                </h3>
                {s.excerpt && (
                  <p className="text-slate-500 text-xs leading-relaxed italic line-clamp-3">
                    &ldquo;{s.excerpt}&rdquo;
                  </p>
                )}
                {s.categories?.[0] && (
                  <span className="inline-block text-[10px] font-bold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {s.categories[0].name}
                  </span>
                )}
              </div>

              {/* Bottom CTA strip */}
              <div className="px-6 pb-5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 group-hover:gap-2.5 transition-all">
                  Đọc câu chuyện đầy đủ
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ── Bottom CTA ────────────────────────────────────────────── */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-brand-950 via-brand-900 to-surface rounded-2xl px-8 py-6 text-center">
            <div className="text-left">
              <p className="text-white font-black text-base">
                Bạn cũng muốn có câu chuyện của mình?
              </p>
              <p className="text-brand-300 text-sm">
                Bắt đầu hành trình ngay hôm nay — hoàn toàn miễn phí.
              </p>
            </div>
            <button
              onClick={() => open("Stories CTA")}
              className="btn-gold shrink-0 px-7 py-3"
            >
              Đăng Ký Tập Thử
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
