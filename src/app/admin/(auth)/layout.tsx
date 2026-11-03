'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

/**
 * Auth routes (login) — no sidebar.
 * If a session is already restored, send the user into the dashboard.
 */
export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isReady = useAuthStore((s) => s.isReady);

  useEffect(() => {
    if (isReady && user) {
      router.replace('/admin');
    }
  }, [isReady, user, router]);

  return <>{children}</>;
}
