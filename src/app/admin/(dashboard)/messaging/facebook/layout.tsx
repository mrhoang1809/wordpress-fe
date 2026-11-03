'use client';

import { ChannelShell } from '@/features/messaging/ChannelShell';

export default function FacebookMessagingLayout({ children }: { children: React.ReactNode }) {
  return <ChannelShell platform="FACEBOOK">{children}</ChannelShell>;
}
