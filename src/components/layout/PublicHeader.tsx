"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, Phone } from "lucide-react";
import { useTrialModal } from "@/components/home/TrialRegistrationModal";
import { cn } from "@/lib/utils";
import { publicApi } from "@/lib/api-client";
import type { Category } from "@/types";

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open } = useTrialModal();
  const pathname = usePathname();

  // Load categories from API for dynamic menu
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    publicApi
      .getCategoryTree()
      .then((cats) => {
        // Filter only root categories (no parentId) and active ones
        const roots = cats.filter((c) => !c.parentId && c.isActive);
        setCategories(roots);
      })
      .finally(() => setLoadingCategories(false));
  }, []);

  const NAV_LINKS = [
    { href: "/#workout", label: "Phương Pháp 30 Phút" },
    { href: "/#advantages", label: "Máy Kháng Thủy Lực" },
    { href: "/#calculator", label: "Tính Calo & BMI" },
    { href: "/#locations", label: "Chi Nhánh" },
    { href: "/blog", label: "Tin tức" },
    { href: "/#faq", label: "Hỏi Đáp" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-accent-magenta flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
            C
          </div>
          <div>
            <span className="text-xl font-black tracking-wider bg-gradient-to-r from-brand-800 via-brand-600 to-accent-magenta bg-clip-text text-transparent">
              CURVES
            </span>
            <span className="hidden sm:block text-[10px] font-bold text-brand-500 uppercase tracking-widest -mt-0.5">
              Women&apos;s 30 Min Fitness
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-700">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "hover:text-brand-600 transition-colors",
                pathname === l.href ||
                  (l.href === "/blog" && pathname.startsWith("/blog"))
                  ? "text-brand-600 font-bold"
                  : "",
              )}
            >
              {l.label}
            </Link>
          ))}
          {/* Dynamic category links from API */}
          {!loadingCategories &&
            categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.slug}
                href={`/blog?category=${cat.slug}`}
                className="hover:text-brand-600 transition-colors text-sm"
              >
                {cat.name}
              </Link>
            ))}
        </nav>

        {/* CTA */}
        <div className="hidden sm:flex items-center gap-4">
          <a
            href="tel:19006363"
            className="hidden xl:flex items-center gap-1.5 text-sm font-bold text-brand-800 hover:text-brand-600"
          >
            <Phone className="w-4 h-4 text-accent-magenta" />
            1900 636 300
          </a>
          <button
            onClick={() => open("Public Header CTA")}
            className="bg-gradient-to-r from-brand-700 to-accent-magenta text-white font-bold px-4 py-2 rounded-full shadow-lg hover:shadow-brand-600/50 hover:scale-105 transition-all text-sm"
          >
            ✨ Đăng Ký Tập Thử
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-brand-50 text-slate-700"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-brand-100 px-4 pt-2 pb-5 space-y-2 shadow-xl">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog?category=${cat.slug}`}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
              onClick={() => setMobileOpen(false)}
            >
              📝 {cat.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                open("Mobile Public Nav");
                setMobileOpen(false);
              }}
              className="w-full bg-brand-700 text-white font-bold py-2.5 rounded-xl text-sm"
            >
              ✨ Đăng Ký Tập Thử Miễn Phí
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
