'use client';

/**
 * useAuth — convenience hook backed by the Zustand auth store.
 *
 * Replaces the old AuthContext / AuthProvider pattern.
 * Provides login / logout actions in addition to state.
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api-client';

export function useAuth() {
  const router = useRouter();
  const { user, isBootstrapping, isReady, setAuth, clearAuth } = useAuthStore();

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user: profile } = await authApi.login(email, password);
    setAuth(accessToken, profile);
    router.replace('/admin');
  }, [setAuth, router]);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => null);
    clearAuth();
    router.replace('/admin/login');
  }, [clearAuth, router]);

  return {
    user,
    /** true while the initial session bootstrap hasn't finished yet */
    isLoading: isBootstrapping,
    isReady,
    login,
    logout,
  };
}
