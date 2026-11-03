"use client";

import { useAuthStore } from "@/store/auth.store";
import { Sparkles } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { promotionsApi } from "@/lib/api-client";
import type { PromotionBanner } from "@/types";

export default function FloatingPromotionButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Dùng cùng key ["active-promotion"] với PromotionCountdownSection → cache hit
  const { data: banner, isLoading } = useQuery<PromotionBanner | null>({
    queryKey: ["active-promotion"],
    queryFn: () => promotionsApi.getActive(),
    staleTime: 5 * 60_000,
    retry: false,
  });

  const handleClick = () => {
    if (pathname === "/") {
      // Đã ở trang chủ → scroll thẳng
      document
        .getElementById("promotion-countdown")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // Trang khác → navigate về / với hash, PromotionCountdownSection tự scroll khi mount
      router.push("/?scroll=promotion");
    }
  };

  // Ẩn nếu: đang load, không có banner, banner hết hạn, hoặc user đã login
  if (isLoading || !banner) return null;
  const expired = new Date(banner.endsAt).getTime() <= Date.now();
  if (expired || user) return null;

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-2.5">
      {/* Tooltip */}
      <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-brand-700/50 bg-surface-raised/90 backdrop-blur-md px-3.5 py-1.5 text-[11px] font-bold text-white shadow-card-dark animate-float">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
        Xem ưu đãi đặc biệt!
      </div>

      {/* Button */}
      <button
        type="button"
        onClick={handleClick}
        aria-label="Xem ưu đãi đặc biệt"
        className="relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-brand-700 via-accent-magenta to-accent-pink px-4 py-3 text-white shadow-glow-magenta hover:shadow-glow-purple hover:scale-105 active:scale-95 transition-all duration-200 animate-pulse-glow"
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-700 via-accent-magenta to-accent-pink opacity-0 blur-md group-hover:opacity-60 transition-opacity" />
        <Sparkles className="w-5 h-5 text-accent-gold animate-shake relative z-10" />
        <div className="hidden sm:block text-left relative z-10">
          <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-yellow-200">
            Khuyến Mãi Hot
          </span>
          <span className="block text-xs font-black leading-tight">
            Ưu Đãi Tháng Này →
          </span>
        </div>
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-rose border-2 border-white text-[8px] font-black shadow-sm z-10">
          !
        </span>
      </button>
    </div>
  );
}
