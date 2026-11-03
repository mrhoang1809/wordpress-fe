import type { MessagePlatform } from '@/types';

export function channelBasePath(platform: MessagePlatform): string {
  return platform === 'ZALO' ? '/admin/messaging/zalo' : '/admin/messaging/facebook';
}

export function channelLabel(platform: MessagePlatform): string {
  return platform === 'ZALO' ? 'Zalo' : 'Facebook';
}
