/**
 * Auth Store — Zustand
 *
 * Single source of truth for authentication state.
 * The access token lives here (in memory, never in localStorage/sessionStorage
 * for security). The refresh token lives in an HttpOnly cookie managed by
 * the backend — the frontend never touches it directly.
 *
 * api-client.ts reads/writes this store for every authenticated request.
 */

import { create } from 'zustand';
import type { UserProfile } from '@/types';

interface AuthState {
  // ─── State ─────────────────────────────────────────────────────────────────
  accessToken: string | null;
  user: UserProfile | null;
  /** true while the initial session restore is in progress */
  isBootstrapping: boolean;
  /** true once the initial session restore has completed (success or fail) */
  isReady: boolean;

  // ─── Actions ───────────────────────────────────────────────────────────────
  setAuth: (token: string, user: UserProfile) => void;
  clearAuth: () => void;
  setBootstrapping: (v: boolean) => void;
  setReady: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isBootstrapping: true,
  isReady: false,

  setAuth: (token, user) =>
    set({ accessToken: token, user, isBootstrapping: false, isReady: true }),

  clearAuth: () =>
    set({ accessToken: null, user: null, isBootstrapping: false, isReady: true }),

  setBootstrapping: (v) => set({ isBootstrapping: v }),
  setReady: (v) => set({ isReady: v }),
}));

/**
 * Convenience: get the current access token without subscribing to the store.
 * Used by api-client.ts which runs outside React.
 */
export const getStoreToken = (): string | null =>
  useAuthStore.getState().accessToken;

/**
 * Convenience: set a new token from outside React (e.g. inside api-client).
 */
export const setStoreToken = (token: string | null): void => {
  if (token) {
    useAuthStore.setState((s) => ({ ...s, accessToken: token }));
  } else {
    useAuthStore.getState().clearAuth();
  }
};
