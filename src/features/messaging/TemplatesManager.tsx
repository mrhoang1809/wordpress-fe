'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '@/lib/api-client';
import type { MessageTemplate, MessagePlatform } from '@/types';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { MESSAGE_TYPE_LABEL } from './labels';

export function TemplatesManager({ platform }: { platform: MessagePlatform }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [messageType, setMessageType] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const qc = useQueryClient();
  const { data: templates, isLoading } = useQuery<MessageTemplate[]>({
    queryKey: ['templates', platform],
    queryFn: () => templatesApi.list(platform),
  });
  const list = Array.isArray(templates) ? templates : [];

  const createMutation = useMutation({
    mutationFn: () => {
      const content: Record<string, unknown> = { messageType };
      if (messageType === 'text') content.text = textContent;
      if (messageType === 'image') content.imageUrl = imageUrl;
      return templatesApi.create({ name, platform, messageType, content });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] });
      resetForm();
    },
  });
  const updateMutation = useMutation({
    mutationFn: (id: string) => {
      const content: Record<string, unknown> = { messageType };
      if (messageType === 'text') content.text = textContent;
      if (messageType === 'image') content.imageUrl = imageUrl;
      return templatesApi.update(id, { name, platform, messageType, content });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] });
      resetForm();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => templatesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setName('');
    setMessageType('text');
    setTextContent('');
    setImageUrl('');
  };

  const handleEdit = (t: MessageTemplate) => {
    setEditId(t.id);
    setName(t.name);
    setMessageType(t.messageType);
    const content = t.content ?? {};
    setTextContent((content.text as string) ?? '');
    setImageUrl((content.imageUrl as string) ?? '');
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Mẫu tin mới
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            editId ? updateMutation.mutate(editId) : createMutation.mutate();
          }}
          className="mb-6 rounded-lg border bg-card p-4 space-y-3 max-w-lg"
        >
          <h3 className="text-sm font-semibold">{editId ? 'Sửa mẫu tin' : 'Mẫu tin mới'}</h3>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Tên mẫu</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Tin chào mừng" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Loại</label>
            <select className="form-input" value={messageType} onChange={(e) => setMessageType(e.target.value)}>
              <option value="text">Văn bản</option>
              <option value="image">Hình ảnh</option>
            </select>
          </div>
          {messageType === 'text' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nội dung</label>
              <textarea className="form-input min-h-[100px]" value={textContent} onChange={(e) => setTextContent(e.target.value)} required />
            </div>
          )}
          {messageType === 'image' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">URL hình ảnh</label>
              <input className="form-input" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required placeholder="https://..." />
            </div>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
              {editId ? 'Cập nhật' : 'Tạo'}
            </button>
            <button type="button" onClick={resetForm} className="rounded-md border px-4 py-2 text-sm">
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-3">
        {isLoading && <p className="text-muted-foreground">Đang tải...</p>}
        {list.map((t) => {
          const content = t.content ?? {};
          return (
            <div key={t.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{t.name}</h3>
                    <span className="inline-flex rounded bg-muted px-2 py-0.5 text-xs">{MESSAGE_TYPE_LABEL[t.messageType] ?? t.messageType}</span>
                    {!t.isActive && <span className="text-xs text-muted-foreground">(không dùng)</span>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground truncate max-w-md">
                    {t.messageType === 'text' ? (content.text as string) : (content.imageUrl as string)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(t)} className="p-1.5 rounded hover:bg-muted" title="Sửa">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Xóa mẫu tin này?')) deleteMutation.mutate(t.id);
                    }}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    title="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {list.length === 0 && !isLoading && (
          <p className="text-center text-sm text-muted-foreground py-8">Chưa có mẫu tin.</p>
        )}
      </div>
    </div>
  );
}
