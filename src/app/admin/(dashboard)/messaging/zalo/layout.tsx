'use client';

import { ChannelShell } from '@/features/messaging/ChannelShell';

export default function ZaloMessagingLayout({ children }: { children: React.ReactNode }) {
  return <ChannelShell platform="ZALO">{children}</ChannelShell>;
}
