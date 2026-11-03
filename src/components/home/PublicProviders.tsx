'use client';

/**
 * PublicProviders
 *
 * Wraps all public pages with TanStack QueryClient for useQuery hooks
 * (used in AnnouncementBar, PromotionCountdownSection, etc.).
 *
 * Public pages include homepage, blog, blog details, and CMS pages.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function PublicProviders({ children }: { children: React.ReactNode }) {
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
