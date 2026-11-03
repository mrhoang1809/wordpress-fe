'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MessagePlatform } from '@/types';
import { cn } from '@/lib/utils';
import { channelBasePath, channelLabel } from './channel';

export function ChannelNav({ platform }: { platform: MessagePlatform }) {
  const pathname = usePathname();
  const base = channelBasePath(platform);
  const tabs = [
    { href: base, label: 'Chiến dịch', match: (path: string) => path === base || path.startsWith(`${base}/campaigns`) },
    { href: `${base}/subscribers`, label: 'Người nhận' },
    { href: `${base}/templates`, label: 'Mẫu tin' },
  ];

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-4">Gửi {channelLabel(platform)}</h1>
      <nav className="flex gap-1 border-b">
        {tabs.map((tab) => {
          const active = tab.match
            ? tab.match(pathname)
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                active
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
