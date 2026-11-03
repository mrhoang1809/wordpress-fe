"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { promotionsApi } from "@/lib/api-client";
import type { PromotionBanner } from "@/types";
import { useTrialModal } from "./TrialRegistrationModal";
import { Sparkles } from "lucide-react";

export function AnnouncementBar() {
  const { open } = useTrialModal();
  const [mounted, setMounted] = useState(false);

  // Dùng cùng key với PromotionCountdownSection và FloatingPromotionButton → cache hit
  const { data: banner, isLoading } = useQuery<PromotionBanner | null>({
    queryKey: ["active-promotion"],
    queryFn: () => promotionsApi.getActive(),
    staleTime: 5 * 60_000,
    retry: false,
    enabled: typeof window !== "undefined",
  });

  useEffect(() => setMounted(true), []);

  // Chưa mount (SSR) hoặc đang fetch → không render gì (tránh hydration mismatch)
  if (!mounted || isLoading) return null;

  // Không có banner hoặc banner hết hạn → ẩn hoàn toàn
  if (!banner) return null;
  const expired = new Date(banner.endsAt).getTime() <= Date.now();
  if (expired) return null;

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-r ${banner.bgGradientFrom} ${banner.bgGradientVia} ${banner.bgGradientTo} py-2 px-4`}
    >
      {/* Shimmer sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_linear_infinite]" />
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 flex-wrap text-xs text-white/90 relative z-10">
        <span
          className={`${banner.badgeBg} ${banner.badgeText2} font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1`}
        >
          <Sparkles className="w-3 h-3" />
          {banner.badgeText}
        </span>
        <span className="font-medium">{banner.headline}</span>
        <button
          onClick={() => open(banner.ctaSource)}
          className="text-accent-gold font-bold hover:text-yellow-300 transition-colors underline underline-offset-2"
        >
          {banner.ctaLabel} →
        </button>
      </div>
    </div>
  );
}
