import type { CampaignStatus, DeliveryStatus } from '@/types';

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  DRAFT: 'Nháp',
  QUEUED: 'Đã xếp hàng',
  SENDING: 'Đang gửi',
  COMPLETED: 'Hoàn tất',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy',
};

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  QUEUED: 'bg-blue-100 text-blue-800',
  SENDING: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

export const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  PENDING: 'Chờ gửi',
  SENT: 'Đã gửi',
  FAILED: 'Thất bại',
  DELIVERED: 'Đã nhận',
  READ: 'Đã đọc',
};

export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  SENT: 'bg-blue-100 text-blue-800',
  FAILED: 'bg-red-100 text-red-800',
  DELIVERED: 'bg-green-100 text-green-800',
  READ: 'bg-purple-100 text-purple-800',
};

export const MESSAGE_TYPE_LABEL: Record<string, string> = {
  text: 'Văn bản',
  image: 'Hình ảnh',
};
