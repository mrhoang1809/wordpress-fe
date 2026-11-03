"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useTrialModal } from "./TrialRegistrationModal";
import { AnnouncementBar } from "@/components/home/AnnouncementBar";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#workout", label: "Phương Pháp" },
  { href: "#advantages", label: "Thiết Bị" },
  { href: "#calculator", label: "BMI & Calo" },
  { href: "#locations", label: "Chi Nhánh" },
  { href: "/stories", label: "Câu Chuyện" },
  { href: "/blog", label: "Tin Tức" },
  { href: "#faq", label: "Hỏi Đáp" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { open } = useTrialModal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.startsWith("#")) return; // let normal links work
    e.preventDefault();
    setMobileOpen(false);
    if (pathname === "/") {
      document
        .getElementById(href.slice(1))
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push("/");
      setTimeout(() => {
        document
          .getElementById(href.slice(1))
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 380);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-brand-100/60 shadow-[0_1px_20px_rgba(147,51,234,0.08)]"
          : "bg-white/70 backdrop-blur-md border-b border-transparent",
      )}
    >
      <AnnouncementBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-6">
        {/* ── Logo ───────────────────────────────────────────────────────── */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 via-accent-magenta to-accent-pink flex items-center justify-center shadow-glow-purple group-hover:scale-105 transition-transform duration-200">
            <span className="text-white font-black text-xl leading-none">
              C
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-gold border-2 border-white" />
          </div>
          <div className="leading-none">
            <span className="block text-[1.35rem] font-black tracking-[0.08em] bg-gradient-to-r from-brand-800 via-brand-600 to-accent-magenta bg-clip-text text-transparent">
              CURVES
            </span>
            <span className="block text-[9px] font-bold text-brand-400 uppercase tracking-[0.22em] -mt-0.5">
              Women&apos;s 30 Min Fitness
            </span>
          </div>
        </button>

        {/* ── Desktop Nav ─────────────────────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              className={cn(
                "relative px-3.5 py-2 text-[13px] font-semibold rounded-lg transition-colors",
                "text-slate-600 hover:text-brand-700 hover:bg-brand-50",
                l.href === pathname && "text-brand-700 bg-brand-50",
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <a
            href="tel:19006363"
            className="hidden xl:flex items-center gap-1.5 text-[13px] font-bold text-brand-700 hover:text-brand-900 transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6.62 10.79a15.15 15.15 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.01l-2.2 2.21z" />
              </svg>
            </span>
            1900 636 300
          </a>
          <button
            onClick={() => open("Header")}
            className="btn-primary text-[13px] px-5 py-2.5"
          >
            ✨ Tập Thử Miễn Phí
          </button>
        </div>

        {/* ── Mobile hamburger ─────────────────────────────────────────── */}
        <button
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-brand-50 text-slate-600 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Mở menu"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* ── Mobile Drawer ─────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-brand-100 px-4 pt-3 pb-6 space-y-1 shadow-2xl animate-slide-up">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold text-slate-700 hover:text-brand-700 hover:bg-brand-50 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                open("Mobile Nav");
                setMobileOpen(false);
              }}
              className="btn-primary w-full justify-center py-3.5 text-[15px]"
            >
              ✨ Đăng Ký Tập Thử Miễn Phí
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
