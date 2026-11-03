'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { campaignsApi, subscribersApi, ApiError } from '@/lib/api-client';
import type { MessagePlatform } from '@/types';
import { Plus, X } from 'lucide-react';
import { channelBasePath, channelLabel } from './channel';

export function CampaignForm({ platform }: { platform: MessagePlatform }) {
  const router = useRouter();
  const base = channelBasePath(platform);
  const [title, setTitle] = useState('');
  const [messageType, setMessageType] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: availableTags } = useQuery<string[]>({
    queryKey: ['subscriberTags'],
    queryFn: () => subscribersApi.getTags(),
  });
  const tags = Array.isArray(availableTags) ? availableTags : [];

  const createMutation = useMutation({
    mutationFn: () => {
      const content: Record<string, unknown> = { messageType };
      if (messageType === 'text') content.text = textContent;
      if (messageType === 'image') {
        content.imageUrl = imageUrl;
        content.caption = imageCaption;
      }
      return campaignsApi.create({
        title,
        platform,
        messageType,
        content,
        targetTags: selectedTags.length > 0 ? selectedTags : undefined,
        scheduledAt: scheduledAt || undefined,
      });
    },
    onSuccess: (campaign) => router.push(`${base}/campaigns/${campaign.id}`),
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Không thể tạo chiến dịch'),
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (messageType === 'text' && !textContent.trim()) {
      setError('Vui lòng nhập nội dung tin nhắn');
      return;
    }
    if (messageType === 'image' && !imageUrl.trim()) {
      setError('Vui lòng nhập URL hình ảnh');
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold mb-6">Chiến dịch {channelLabel(platform)} mới</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Tiêu đề</label>
          <input
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Khuyến mãi mùa hè"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Loại tin</label>
          <select className="form-input" value={messageType} onChange={(e) => setMessageType(e.target.value)}>
            <option value="text">Văn bản</option>
            <option value="image">Hình ảnh</option>
          </select>
        </div>

        {messageType === 'text' && (
          <div className="space-y-1">
            <label className="text-sm font-medium">Nội dung</label>
            <textarea
              className="form-input min-h-[120px]"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Xin chào! Chúng tôi có ưu đãi dành cho bạn..."
              required
            />
            <p className="text-xs text-muted-foreground">{textContent.length} ký tự</p>
          </div>
        )}

        {messageType === 'image' && (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium">URL hình ảnh</label>
              <input
                className="form-input"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Chú thích (không bắt buộc)</label>
              <input className="form-input" value={imageCaption} onChange={(e) => setImageCaption(e.target.value)} />
            </div>
          </>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium">Nhãn đối tượng (không bắt buộc)</label>
          <p className="text-xs text-muted-foreground mb-2">
            Để trống để gửi tới tất cả người nhận trên {channelLabel(platform)}
          </p>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {selectedTags.includes(tag) && <X className="h-3 w-3" />}
                  {tag}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Chưa có nhãn. Thêm nhãn khi tạo người nhận.</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Lịch gửi (không bắt buộc)</label>
          <input
            className="form-input"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Để trống để lưu nháp và gửi thủ công sau</p>
        </div>

        {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {createMutation.isPending ? 'Đang tạo...' : 'Tạo chiến dịch'}
          </button>
          <button type="button" onClick={() => router.push(base)} className="rounded-md border px-4 py-2 text-sm">
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
