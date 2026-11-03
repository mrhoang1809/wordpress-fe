'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '@/lib/api-client';
import type { CampaignStatus, MessageCampaign, MessagePlatform, PaginatedResponse } from '@/types';
import { formatDate } from '@/lib/utils';
import { unwrapList, unwrapMeta } from '@/lib/pagination';
import { Plus, Send, Ban, Trash2, Eye } from 'lucide-react';
import { channelBasePath } from './channel';
import { CAMPAIGN_STATUS_COLORS, CAMPAIGN_STATUS_LABEL } from './labels';

export function CampaignsList({ platform }: { platform: MessagePlatform }) {
  const base = channelBasePath(platform);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const params: Record<string, string | number> = { page, pageSize: 20, platform };
  if (statusFilter) params.status = statusFilter;

  const { data, isLoading } = useQuery<PaginatedResponse<MessageCampaign>>({
    queryKey: ['campaigns', platform, params],
    queryFn: () => campaignsApi.list(params),
  });

  const campaigns = unwrapList(data);
  const meta = unwrapMeta(data);
  const qc = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: (id: string) => campaignsApi.send(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
  const cancelMutation = useMutation({
    mutationFn: (id: string) => campaignsApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => campaignsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <select
          className="form-input w-44"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          {(Object.keys(CAMPAIGN_STATUS_LABEL) as CampaignStatus[]).map((status) => (
            <option key={status} value={status}>
              {CAMPAIGN_STATUS_LABEL[status]}
            </option>
          ))}
        </select>
        <Link
          href={`${base}/campaigns/new`}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Chiến dịch mới
        </Link>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Tiêu đề</th>
              <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium">Người nhận</th>
              <th className="text-left px-4 py-3 font-medium">Gửi / Lỗi</th>
              <th className="text-left px-4 py-3 font-medium">Ngày tạo</th>
              <th className="text-left px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Đang tải...
                </td>
              </tr>
            )}
            {!isLoading && campaigns.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Chưa có chiến dịch nào.
                </td>
              </tr>
            )}
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link href={`${base}/campaigns/${campaign.id}`} className="font-medium hover:underline">
                    {campaign.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CAMPAIGN_STATUS_COLORS[campaign.status]}`}>
                    {CAMPAIGN_STATUS_LABEL[campaign.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{campaign.totalRecipients}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {campaign.sentCount} / {campaign.failedCount}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(campaign.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`${base}/campaigns/${campaign.id}`} className="p-1.5 rounded hover:bg-muted" title="Xem">
                      <Eye className="h-4 w-4" />
                    </Link>
                    {(campaign.status === 'DRAFT' || campaign.status === 'QUEUED') && (
                      <button
                        onClick={() => sendMutation.mutate(campaign.id)}
                        className="p-1.5 rounded hover:bg-muted text-primary"
                        title="Gửi ngay"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    )}
                    {campaign.status === 'SENDING' && (
                      <button
                        onClick={() => cancelMutation.mutate(campaign.id)}
                        className="p-1.5 rounded hover:bg-muted text-amber-600"
                        title="Hủy gửi"
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    )}
                    {campaign.status !== 'SENDING' && (
                      <button
                        onClick={() => {
                          if (confirm('Xóa chiến dịch này?')) deleteMutation.mutate(campaign.id);
                        }}
                        className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Trang {meta.page} / {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <button className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Trước
            </button>
            <button className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
