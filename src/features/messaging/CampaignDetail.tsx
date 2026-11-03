'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '@/lib/api-client';
import type { MessageCampaign, CampaignStats, MessagePlatform } from '@/types';
import { formatDate } from '@/lib/utils';
import { Send, Ban, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { channelBasePath, channelLabel } from './channel';
import {
  CAMPAIGN_STATUS_LABEL,
  DELIVERY_STATUS_COLORS,
  DELIVERY_STATUS_LABEL,
  MESSAGE_TYPE_LABEL,
} from './labels';

export function CampaignDetail({ platform, id }: { platform: MessagePlatform; id: string }) {
  const base = channelBasePath(platform);
  const router = useRouter();
  const qc = useQueryClient();

  const { data: campaign, isLoading } = useQuery<MessageCampaign>({
    queryKey: ['campaign', id],
    queryFn: () => campaignsApi.get(id),
  });

  const { data: stats } = useQuery<CampaignStats>({
    queryKey: ['campaignStats', id],
    queryFn: () => campaignsApi.getStats(id),
    refetchInterval: (query) => (query.state.data?.status === 'SENDING' ? 3000 : false),
  });

  const sendMutation = useMutation({
    mutationFn: () => campaignsApi.send(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaign', id] }),
  });
  const cancelMutation = useMutation({
    mutationFn: () => campaignsApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaign', id] }),
  });
  const deleteMutation = useMutation({
    mutationFn: () => campaignsApi.delete(id),
    onSuccess: () => router.push(base),
  });

  if (isLoading || !campaign) {
    return <p className="text-muted-foreground">Đang tải...</p>;
  }

  const content = campaign.content ?? {};
  const targetTags = campaign.targetTags ?? [];
  const recipients = campaign.recipients ?? [];
  const progress =
    campaign.totalRecipients > 0
      ? Math.round(((campaign.sentCount + campaign.failedCount) / campaign.totalRecipients) * 100)
      : 0;

  return (
    <div>
      <Link href={base} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{campaign.title}</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex rounded bg-muted px-2 py-0.5 text-xs font-medium">{channelLabel(campaign.platform)}</span>
            <span className="text-sm text-muted-foreground">Tạo {formatDate(campaign.createdAt)}</span>
            {campaign.createdBy && (
              <span className="text-sm text-muted-foreground">
                bởi {campaign.createdBy.firstName} {campaign.createdBy.lastName}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(campaign.status === 'DRAFT' || campaign.status === 'QUEUED') && (
            <button
              onClick={() => sendMutation.mutate()}
              disabled={sendMutation.isPending}
              className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> {sendMutation.isPending ? 'Đang bắt đầu...' : 'Gửi ngay'}
            </button>
          )}
          {campaign.status === 'SENDING' && (
            <button
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="flex items-center gap-1.5 rounded-md border border-amber-500 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50"
            >
              <Ban className="h-4 w-4" /> Hủy gửi
            </button>
          )}
          {campaign.status !== 'SENDING' && (
            <button
              onClick={() => {
                if (confirm('Xóa chiến dịch này?')) deleteMutation.mutate();
              }}
              className="flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" /> Xóa
            </button>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Tổng', value: stats.total, color: '' },
            { label: 'Chờ gửi', value: stats.pending, color: 'text-gray-600' },
            { label: 'Đã gửi', value: stats.sent, color: 'text-blue-600' },
            { label: 'Đã nhận', value: stats.delivered, color: 'text-green-600' },
            { label: 'Đã đọc', value: stats.read, color: 'text-purple-600' },
            { label: 'Thất bại', value: stats.failed, color: 'text-red-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {campaign.status === 'SENDING' && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Tiến độ: {progress}%</span>
            <span className="text-muted-foreground">
              {campaign.sentCount + campaign.failedCount} / {campaign.totalRecipients}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3 pb-2 border-b">Thông tin chiến dịch</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Trạng thái</dt>
              <dd className="font-medium">{CAMPAIGN_STATUS_LABEL[campaign.status]}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Kênh</dt>
              <dd className="font-medium">{channelLabel(campaign.platform)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Loại tin</dt>
              <dd className="font-medium">{MESSAGE_TYPE_LABEL[campaign.messageType] ?? campaign.messageType}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Nhãn đối tượng</dt>
              <dd className="font-medium">{targetTags.length > 0 ? targetTags.join(', ') : 'Tất cả người nhận'}</dd>
            </div>
            {campaign.scheduledAt && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Lịch gửi</dt>
                <dd className="font-medium">{formatDate(campaign.scheduledAt)}</dd>
              </div>
            )}
            {campaign.startedAt && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Bắt đầu</dt>
                <dd className="font-medium">{formatDate(campaign.startedAt)}</dd>
              </div>
            )}
            {campaign.completedAt && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Hoàn tất</dt>
                <dd className="font-medium">{formatDate(campaign.completedAt)}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3 pb-2 border-b">Xem trước tin nhắn</h3>
          <div className="bg-muted/30 rounded-md p-3">
            {campaign.messageType === 'text' && (
              <p className="text-sm whitespace-pre-wrap">{String(content.text ?? '(trống)')}</p>
            )}
            {campaign.messageType === 'image' && (
              <div>
                {typeof content.imageUrl === 'string' && content.imageUrl && (
                  <img
                    src={content.imageUrl}
                    alt={typeof content.caption === 'string' ? content.caption : ''}
                    className="rounded-md mb-2 max-h-48 object-cover"
                  />
                )}
                {typeof content.caption === 'string' && content.caption && <p className="text-sm">{content.caption}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {recipients.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <h3 className="px-4 py-3 text-sm font-semibold bg-muted/50 border-b">
            Chi tiết gửi ({recipients.length} người nhận)
          </h3>
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Tên</th>
                <th className="text-left px-4 py-2 font-medium">ID kênh</th>
                <th className="text-left px-4 py-2 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-2 font-medium">Lỗi</th>
                <th className="text-left px-4 py-2 font-medium">Gửi lúc</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recipients.slice(0, 50).map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">{r.subscriber?.name ?? 'Không rõ'}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs">
                    {r.subscriber?.zaloUserId ?? r.subscriber?.facebookPsid ?? '—'}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${DELIVERY_STATUS_COLORS[r.status]}`}>
                      {DELIVERY_STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground text-xs truncate max-w-xs">{r.errorMessage ?? '—'}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs">{r.sentAt ? formatDate(r.sentAt) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recipients.length > 50 && (
            <p className="px-4 py-2 text-xs text-muted-foreground border-t">Hiển thị 50 người nhận đầu tiên...</p>
          )}
        </div>
      )}
    </div>
  );
}
