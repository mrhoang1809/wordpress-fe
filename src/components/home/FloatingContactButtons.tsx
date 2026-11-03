"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api-client";
import type { SiteSetting } from "@/types";

// ── Fallback nếu admin chưa set ────────────────────────────────────────────────
const DEFAULT_HOTLINE = "19006363";
const DEFAULT_ZALO = "https://zalo.me/19006363";
const DEFAULT_FACEBOOK = "https://m.me/curvesvietnam";

// ── SVG icons ──────────────────────────────────────────────────────────────────

function ZaloIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" fill="#0068FF" />
      <text
        x="24"
        y="32"
        textAnchor="middle"
        fill="white"
        fontSize="18"
        fontWeight="900"
        fontFamily="Arial, sans-serif"
      >
        Z
      </text>
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" fill="#1877F2" />
      <path
        d="M27 14h-3a5 5 0 0 0-5 5v3h-3v4h3v10h4V26h3l1-4h-4v-3a1 1 0 0 1 1-1h3v-4z"
        fill="white"
      />
    </svg>
  );
}

// ── Tooltip ────────────────────────────────────────────────────────────────────

function Tooltip({ label }: { label: string }) {
  return (
    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1.5 shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 select-none">
      {label}
      <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900/90" />
    </span>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export function FloatingContactButtons() {
  const [callRipple, setCallRipple] = useState(false);

  // Dùng cùng key ["settings"] với admin settings page → cache hit
  const { data: settings } = useQuery<SiteSetting>({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
    staleTime: 5 * 60_000,
    retry: false,
  });

  // Dùng giá trị từ settings, fallback về default nếu chưa set
  const hotline = settings?.hotline || DEFAULT_HOTLINE;
  const zaloUrl = settings?.zaloUrl || DEFAULT_ZALO;
  const facebookUrl = settings?.facebookUrl || DEFAULT_FACEBOOK;

  const triggerRipple = () => {
    setCallRipple(true);
    setTimeout(() => setCallRipple(false), 600);
  };

  return (
    <div className="fixed bottom-6 left-5 z-50 flex flex-col items-start gap-3">
      {/* Hotline */}
      <div className="relative group">
        <Tooltip
          label={`Gọi ngay: ${hotline.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3")}`}
        />
        <a
          href={`tel:${hotline}`}
          onClick={triggerRipple}
          aria-label={`Gọi hotline ${hotline}`}
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-[0_4px_20px_rgba(16,185,129,0.5)] hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <Phone className="w-5 h-5" />
          <span
            className={`absolute inset-0 rounded-full border-2 border-emerald-400 ${
              callRipple
                ? "animate-ping"
                : "animate-[ping_2s_ease-in-out_infinite]"
            } opacity-60`}
          />
        </a>
      </div>

      {/* Zalo */}
      <div className="relative group">
        <Tooltip label="Chat Zalo" />
        <a
          href={zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat Zalo"
          className="flex items-center justify-center w-12 h-12 rounded-full overflow-hidden shadow-[0_4px_20px_rgba(0,104,255,0.45)] hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <ZaloIcon className="w-12 h-12" />
        </a>
      </div>

      {/* Facebook */}
      <div className="relative group">
        <Tooltip label="Nhắn tin Facebook" />
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Nhắn tin Facebook Messenger"
          className="flex items-center justify-center w-12 h-12 rounded-full overflow-hidden shadow-[0_4px_20px_rgba(24,119,242,0.45)] hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <FacebookIcon className="w-12 h-12" />
        </a>
      </div>
    </div>
  );
}
