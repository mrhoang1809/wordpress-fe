"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api-client";
import { useTrialModal } from "./TrialRegistrationModal";
import { MapPin, Phone, Mail, ChevronDown, ArrowRight } from "lucide-react";
import type { Location } from "@/types";
import { DEMO_LOCATIONS } from "@/lib/demo-content";

const CITY_MAP: Record<string, string> = {
  HCM: "TP.HCM",
  HN: "Hà Nội",
  DN: "Đà Nẵng",
  TH: "Thanh Hóa",
};

const CITY_COLORS: Record<string, string> = {
  HCM: "from-rose-500/20 to-pink-600/10 border-rose-400/30 text-rose-400",
  HN: "from-blue-500/20 to-indigo-600/10 border-blue-400/30 text-blue-400",
  DN: "from-emerald-500/20 to-teal-600/10 border-emerald-400/30 text-emerald-400",
  TH: "from-amber-500/20 to-orange-600/10 border-amber-400/30 text-amber-400",
};

function slugToCity(slug: string): string {
  const s = slug.toLowerCase();
  if (
    s.includes("quan") ||
    s.includes("phu-nhuan") ||
    s.includes("phu nhuan") ||
    s.includes("thu duc") ||
    s.includes("thu-duc") ||
    s.includes("nguyen-trai") ||
    s.includes("nguyen trai") ||
    s.includes("pasteur") ||
    s.includes("hoang-dieu") ||
    s.includes("hoang dieu")
  )
    return "HCM";
  if (
    s.includes("ba-dinh") ||
    s.includes("ba dinh") ||
    s.includes("tay-son") ||
    s.includes("tay son") ||
    s.includes("kim-ma") ||
    s.includes("kim ma")
  )
    return "HN";
  if (
    s.includes("hai-chau") ||
    s.includes("hai chau") ||
    s.includes("nguyen-van-linh") ||
    s.includes("nguyen van linh")
  )
    return "DN";
  if (
    s.includes("thanh-hoa") ||
    s.includes("thanh hoa") ||
    s.includes("le-loi") ||
    s.includes("le loi")
  )
    return "TH";
  return "HCM";
}

export function LocationsSection() {
  const [cityFilter, setCityFilter] = useState("ALL");
  const { open } = useTrialModal();

  const { data, isLoading } = useQuery<Location[]>({
    queryKey: ["public-locations"],
    queryFn: () => publicApi.listLocations(),
    staleTime: 600_000,
    retry: false,
    placeholderData: DEMO_LOCATIONS,
  });

  const locations = data?.length ? data : DEMO_LOCATIONS;
  const filtered =
    cityFilter === "ALL"
      ? locations
      : locations.filter((l) => slugToCity(l.slug) === cityFilter);
  const cities = Array.from(new Set(locations.map((l) => slugToCity(l.slug))));

  return (
    <section
      id="locations"
      className="py-24 bg-brand-950 relative overflow-hidden noise-overlay"
    >
      {/* Gradient orbs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-800/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent-magenta/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-8">
          <div className="space-y-3">
            <span className="section-eyebrow">📍 Hệ Thống Phủ Sóng</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-[1.05] tracking-tight">
              Tìm Chi Nhánh
              <br />
              <span className="gradient-text">Curves Gần Bạn</span>
            </h2>
            <p className="text-brand-300 text-[15px]">
              {isLoading
                ? "Đang tải..."
                : `${locations.length} chi nhánh hiện đại trên toàn quốc`}
            </p>
          </div>

          {/* City filter */}
          <div className="w-full md:w-64">
            <div className="relative">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full appearance-none bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold text-sm px-4 py-3 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              >
                <option value="ALL" className="bg-brand-950 text-white">
                  Tất Cả Thành Phố
                </option>
                {cities.includes("HCM") && (
                  <option value="HCM" className="bg-brand-950 text-white">
                    TP. Hồ Chí Minh
                  </option>
                )}
                {cities.includes("HN") && (
                  <option value="HN" className="bg-brand-950 text-white">
                    Hà Nội
                  </option>
                )}
                {cities.includes("DN") && (
                  <option value="DN" className="bg-brand-950 text-white">
                    Đà Nẵng
                  </option>
                )}
                {cities.includes("TH") && (
                  <option value="TH" className="bg-brand-950 text-white">
                    Thanh Hóa
                  </option>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-brand-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Grid ─────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-52 rounded-2xl skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-brand-400">
            Không tìm thấy chi nhánh nào trong khu vực này.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((loc) => {
              const city = slugToCity(loc.slug);
              const colorClass = CITY_COLORS[city] ?? CITY_COLORS.HCM;
              return (
                <article
                  key={loc.id}
                  className="group relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-white/25 p-6 transition-all duration-300 hover:bg-white/8 hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-3">
                      <h3 className="font-black text-white text-[15px] leading-tight group-hover:text-brand-200 transition-colors">
                        {loc.name}
                      </h3>
                    </div>
                    <span
                      className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full border bg-gradient-to-r ${colorClass} uppercase tracking-wider`}
                    >
                      {CITY_MAP[city] ?? city}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-brand-300">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-brand-400" />
                      <span className="leading-snug text-[13px]">
                        {loc.address}
                      </span>
                    </div>
                    {loc.phone && (
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-3.5 h-3.5 shrink-0 text-brand-400" />
                        <a
                          href={`tel:${loc.phone}`}
                          className="text-[13px] hover:text-white transition-colors"
                        >
                          {loc.phone}
                        </a>
                      </div>
                    )}
                    {loc.email && (
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-3.5 h-3.5 shrink-0 text-brand-400" />
                        <a
                          href={`mailto:${loc.email}`}
                          className="text-[13px] hover:text-white transition-colors truncate"
                        >
                          {loc.email}
                        </a>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => open(`Location ${loc.name}`)}
                    className="mt-5 w-full flex items-center justify-center gap-1.5 bg-white/5 hover:bg-brand-700/60 border border-white/10 hover:border-brand-500/50 text-white font-bold text-xs py-2.5 rounded-xl transition-all group/btn"
                  >
                    Đăng Ký Tập Thử Tại Đây
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
