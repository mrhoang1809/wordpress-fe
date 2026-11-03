'use client';

import { ChannelShell } from '@/features/messaging/ChannelShell';
import { CampaignsList } from '@/features/messaging/CampaignsList';

export default function MessagingIndexPage() {
  return (
    <ChannelShell platform="ZALO">
      <CampaignsList platform="ZALO" />
    </ChannelShell>
  );
}
