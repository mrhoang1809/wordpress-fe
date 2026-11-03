"use client";

import { useEffect, useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { promotionsApi } from "@/lib/api-client";
import type { PromotionBanner } from "@/types";
import { useTrialModal } from "./TrialRegistrationModal";
import { Flame } from "lucide-react";

// ─── Countdown ────────────────────────────────────────────────────────────────

interface TimeLeft {
  days: string;
  hours: string;
  mins: string;
  secs: string;
  expired: boolean;
}

function calcTimeLeft(endsAt: string): TimeLeft {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    days: pad(Math.floor(diff / 86400000)),
    hours: pad(Math.floor((diff % 86400000) / 3600000)),
    mins: pad(Math.floor((diff % 3600000) / 60000)),
    secs: pad(Math.floor((diff % 60000) / 1000)),
    expired: diff === 0,
  };
}

function Countdown({ endsAt }: { endsAt: string }) {
  const [t, setT] = useState<TimeLeft>(() => calcTimeLeft(endsAt));
  useEffect(() => {
    const id = setInterval(() => setT(calcTimeLeft(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (t.expired)
    return (
      <p className="text-sm font-bold text-white/60">
        Chương trình đã kết thúc.
      </p>
    );

  const units = [
    { value: t.days, label: "Ngày" },
    { value: t.hours, label: "Giờ" },
    { value: t.mins, label: "Phút" },
    { value: t.secs, label: "Giây" },
  ];

  return (
    <div className="flex items-center gap-2.5">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-2.5">
          <div className="relative gradient-border rounded-xl overflow-hidden">
            <div className="bg-surface-raised/80 backdrop-blur-sm px-4 py-3 min-w-[64px] text-center">
              <span className="block text-2xl font-black text-white tabular-nums leading-none">
                {u.value}
              </span>
              <span className="block text-[10px] font-bold text-brand-300 uppercase tracking-widest mt-0.5">
                {u.label}
              </span>
            </div>
          </div>
          {i < 3 && <span className="text-xl font-black text-white/40">:</span>}
        </div>
      ))}
    </div>
  );
}

// ─── Banner Content ───────────────────────────────────────────────────────────

function BannerContent({
  banner,
  onCTAClick,
}: {
  banner: PromotionBanner;
  onCTAClick?: (s: string) => void;
}) {
  const { open } = useTrialModal();
  const searchParams = useSearchParams();
  const handleCTA = () =>
    onCTAClick ? onCTAClick(banner.ctaSource) : open(banner.ctaSource);

  // Khi navigate từ trang khác với ?scroll=promotion, tự scroll tới section này
  useEffect(() => {
    if (searchParams.get("scroll") === "promotion") {
      // Delay nhỏ để đảm bảo DOM đã render xong
      const id = setTimeout(() => {
        document
          .getElementById("promotion-countdown")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        // Xóa param khỏi URL mà không reload
        const url = new URL(window.location.href);
        url.searchParams.delete("scroll");
        window.history.replaceState({}, "", url.toString());
      }, 120);
      return () => clearTimeout(id);
    }
  }, [searchParams]);

  return (
    <section
      id="promotion-countdown"
      className="relative overflow-hidden noise-overlay"
    >
      {/* Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${banner.bgGradientFrom} ${banner.bgGradientVia} ${banner.bgGradientTo}`}
      />
      {/* Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-magenta/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-xs font-black text-white uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-accent-gold" />
              {banner.badgeText}
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white leading-[1.1] tracking-tight">
              {banner.headline}
            </h2>

            {banner.description && (
              <p className="text-white/70 text-base leading-relaxed max-w-lg">
                {banner.description}
              </p>
            )}

            <div className="pt-2 space-y-3">
              <p className="text-xs font-bold text-brand-300 uppercase tracking-widest">
                {banner.countdownLabel}
              </p>
              <Countdown endsAt={banner.endsAt} />
            </div>
          </div>

          {/* Right — CTA card */}
          <div className="flex justify-center lg:justify-end">
            <div className="glass p-8 text-center space-y-5 max-w-xs w-full">
              <div className="text-4xl">🎁</div>
              <p className="text-white font-bold text-lg leading-snug">
                Đăng ký ngay hôm nay
                <br />
                <span className="text-accent-gold">nhận ưu đãi đặc biệt!</span>
              </p>
              <button
                onClick={handleCTA}
                className="btn-gold w-full justify-center py-4 text-base"
              >
                {banner.ctaLabel}
              </button>
              <p className="text-white/40 text-xs">
                Không cần thẻ tín dụng · Miễn phí hoàn toàn
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function PromotionCountdownSection({
  onCTAClick,
}: {
  onCTAClick?: (s: string) => void;
}) {
  const { data: banner, isLoading } = useQuery<PromotionBanner | null>({
    queryKey: ["active-promotion"],
    queryFn: () => promotionsApi.getActive(),
    staleTime: 5 * 60_000,
    retry: false,
  });

  if (isLoading || !banner) return null;
  return (
    <Suspense fallback={null}>
      <BannerContent banner={banner} onCTAClick={onCTAClick} />
    </Suspense>
  );
}
