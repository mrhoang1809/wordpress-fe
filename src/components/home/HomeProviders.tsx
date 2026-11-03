'use client';

/**
 * HomeProviders
 *
 * Wraps the public homepage with TanStack QueryClient so that
 * PromotionCountdownSection and any other client components can use
 * useQuery to fetch data from the backend.
 *
 * Uses a separate QueryClient instance from the admin one —
 * the homepage has different caching requirements.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function HomeProviders({ children }: { children: React.ReactNode }) {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60_000,   // 5 min — public data is relatively static
            gcTime: 10 * 60_000,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
