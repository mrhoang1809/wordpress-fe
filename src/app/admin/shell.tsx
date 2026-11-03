"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

/**
 * Dashboard shell — sidebar + main.
 * Blocks children until AuthBootstrap finishes and a user is present.
 */
export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const { isBootstrapping, isReady, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !user) {
      router.replace("/admin/login");
    }
  }, [isReady, user, router]);

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <div
            role="status"
            aria-label="Đang tải"
            className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
          />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
