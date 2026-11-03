'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { AuthBootstrap } from '@/features/auth/AuthBootstrap';
import { ApiError } from '@/lib/api-client';

/**
 * AdminProviders
 *
 * Wraps the entire admin subtree with:
 *   1. TanStack QueryClient  — data fetching & caching
 *   2. AuthBootstrap         — silent session restore via refresh cookie
 *
 * Auth state lives in Zustand. Dashboard layout (sidebar) only mounts
 * after a session exists; the login route group has no sidebar.
 */
export function AdminProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            // Don't retry on 401/403 — these are auth errors, not transient failures.
            // The api-client already handles one silent refresh attempt internally.
            retry: (failureCount, error) => {
              if (error instanceof ApiError) {
                if (error.statusCode === 401 || error.statusCode === 403) return false;
              }
              return failureCount < 1;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* AuthBootstrap fires once on mount, restores session via HttpOnly cookie */}
      <AuthBootstrap>
        {children}
      </AuthBootstrap>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
