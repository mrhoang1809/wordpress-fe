"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  FolderTree,
  Menu,
  Image,
  Settings,
  LogOut,
  MessageCircle,
  Facebook,
  Megaphone,
  MapPin,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthProvider";

const NAV_ITEMS = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/admin/pages", label: "Trang", icon: FileText },
  { href: "/admin/posts", label: "Tin Tức (/blog)", icon: BookOpen },
  { href: "/admin/stories", label: "Câu Chuyện (/stories)", icon: Heart },
  { href: "/admin/categories", label: "Danh mục", icon: FolderTree },
  { href: "/admin/locations", label: "Chi Nhánh", icon: MapPin },
  { href: "/admin/menus", label: "Menu", icon: Menu },
  { href: "/admin/media", label: "Thư viện", icon: Image },
  { href: "/admin/promotions", label: "Promotion", icon: Megaphone },
  { href: "/admin/messaging/zalo", label: "Gửi Zalo", icon: MessageCircle },
  { href: "/admin/messaging/facebook", label: "Gửi Facebook", icon: Facebook },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

function isNavActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  if (pathname === href || pathname.startsWith(`${href}/`)) {
    const hasMoreSpecific = NAV_ITEMS.some(
      (item) =>
        item.href !== href &&
        item.href.startsWith(`${href}/`) &&
        (pathname === item.href || pathname.startsWith(`${item.href}/`)),
    );
    return !hasMoreSpecific;
  }
  return false;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 shrink-0 border-r bg-card flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-lg font-bold">CMS Admin</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isNavActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        {user && (
          <div className="mb-2 text-xs text-muted-foreground truncate">
            {user.firstName} {user.lastName}
          </div>
        )}
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
