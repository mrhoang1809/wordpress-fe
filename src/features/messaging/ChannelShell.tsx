'use client';

import type { MessagePlatform } from '@/types';
import { ChannelNav } from './ChannelNav';

export function ChannelShell({
  platform,
  children,
}: {
  platform: MessagePlatform;
  children: React.ReactNode;
}) {
  return (
    <div className="p-8">
      <ChannelNav platform={platform} />
      {children}
    </div>
  );
}
