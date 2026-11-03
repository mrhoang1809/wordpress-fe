"use client";

/**
 * AuthBootstrap
 *
 * Mounts once when the admin tree first loads.
 * Restores the session using the HttpOnly refresh cookie, then stores
 * the access token in Zustand (memory only).
 */

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth.store";
import { authApi, BASE_URL } from "@/lib/api-client";

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, isReady } = useAuthStore();
  const ran = useRef(false);

  useEffect(() => {
    // Guard: run only once per mount, skip if already resolved
    if (ran.current || isReady) return;
    ran.current = true;

    (async () => {
      try {
        // Step 1: silent refresh using the HttpOnly cookie
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!refreshRes.ok) {
          clearAuth();
          return;
        }

        const { accessToken } = (await refreshRes.json()) as {
          accessToken: string;
        };

        // Step 2: fetch user profile with the fresh token
        const profile = await authApi.me(accessToken);

        // Step 3: hydrate the Zustand store
        setAuth(accessToken, profile);
      } catch {
        clearAuth();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← empty: intentionally runs once on mount only

  return <>{children}</>;
}
