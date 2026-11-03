'use client';

import { use } from 'react';
import { CampaignDetail } from '@/features/messaging/CampaignDetail';

export default function ZaloCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CampaignDetail platform="ZALO" id={id} />;
}
