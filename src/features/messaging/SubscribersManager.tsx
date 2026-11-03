'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscribersApi } from '@/lib/api-client';
import type { PaginatedResponse, Subscriber, MessagePlatform } from '@/types';
import { unwrapList, unwrapMeta } from '@/lib/pagination';
import { Plus, Trash2, Pencil, Upload } from 'lucide-react';
import { channelLabel } from './channel';

export function SubscribersManager({ platform }: { platform: MessagePlatform }) {
  const isZalo = platform === 'ZALO';
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [channelId, setChannelId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<{ created: number; skipped: number } | null>(null);

  const params: Record<string, string | number> = { page, pageSize: 50, platform };
  if (search) params.search = search;
  if (tagFilter) params.tag = tagFilter;

  const { data, isLoading } = useQuery<PaginatedResponse<Subscriber>>({
    queryKey: ['subscribers', platform, params],
    queryFn: () => subscribersApi.list(params),
  });

  const { data: availableTags } = useQuery<string[]>({
    queryKey: ['subscriberTags'],
    queryFn: () => subscribersApi.getTags(),
  });

  const subscribers = unwrapList(data);
  const meta = unwrapMeta(data);
  const tagOptions = Array.isArray(availableTags) ? availableTags : [];
  const qc = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Subscriber>) => subscribersApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscribers'] });
      qc.invalidateQueries({ queryKey: ['subscriberTags'] });
      resetForm();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Subscriber> }) => subscribersApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscribers'] });
      resetForm();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => subscribersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscribers'] }),
  });
  const importMutation = useMutation({
    mutationFn: (rows: Partial<Subscriber>[]) => subscribersApi.import(rows),
    onSuccess: (result) => {
      setImportResult(result);
      qc.invalidateQueries({ queryKey: ['subscribers'] });
      qc.invalidateQueries({ queryKey: ['subscriberTags'] });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setName('');
    setPhone('');
    setEmail('');
    setChannelId('');
    setTags([]);
    setNotes('');
    setError(null);
  };

  const handleEdit = (sub: Subscriber) => {
    setEditId(sub.id);
    setName(sub.name);
    setPhone(sub.phone ?? '');
    setEmail(sub.email ?? '');
    setChannelId((isZalo ? sub.zaloUserId : sub.facebookPsid) ?? '');
    setTags(sub.tags ?? []);
    setNotes(sub.notes ?? '');
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload: Partial<Subscriber> = {
      name,
      phone: phone || undefined,
      email: email || undefined,
      tags,
      notes: notes || undefined,
      ...(isZalo ? { zaloUserId: channelId || undefined } : { facebookPsid: channelId || undefined }),
    };
    if (editId) updateMutation.mutate({ id: editId, payload });
    else createMutation.mutate(payload);
  };

  const handleImport = () => {
    try {
      const lines = importText.trim().split('\n');
      const rows = lines.map((line) => {
        const parts = line.split(',').map((s) => s.trim());
        return {
          name: parts[0] || 'Không tên',
          phone: parts[1] || undefined,
          ...(isZalo ? { zaloUserId: parts[2] || undefined } : { facebookPsid: parts[2] || undefined }),
          tags: parts[3] ? parts[3].split(';') : [],
        };
      });
      importMutation.mutate(rows);
    } catch {
      setError('Không đọc được dữ liệu nhập');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-4">
        <button onClick={() => setShowImport(!showImport)} className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-muted">
          <Upload className="h-4 w-4" /> Nhập CSV
        </button>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Thêm người nhận
        </button>
      </div>

      {showImport && (
        <div className="mb-6 rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Nhập hàng loạt (CSV)</h3>
          <p className="text-xs text-muted-foreground">
            Mỗi dòng: tên,điện thoại,{isZalo ? 'zaloUserId' : 'facebookPsid'},nhãn(cách nhau bằng ;)
          </p>
          <textarea
            className="form-input min-h-[120px] font-mono text-sm"
            placeholder={isZalo ? 'Nguyen Van A,0901234567,zalo_user_123,VIP;Newsletter' : 'Nguyen Van A,0901234567,fb_psid_456,VIP'}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          {importResult && (
            <p className="text-sm">
              Đã tạo: {importResult.created}, Bỏ qua (trùng): {importResult.skipped}
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={handleImport} disabled={importMutation.isPending} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
              {importMutation.isPending ? 'Đang nhập...' : 'Nhập'}
            </button>
            <button
              onClick={() => {
                setShowImport(false);
                setImportText('');
                setImportResult(null);
              }}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">{editId ? 'Sửa người nhận' : 'Thêm người nhận'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Tên *</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Điện thoại</label>
              <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0901234567" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {isZalo ? 'Zalo User ID' : 'Facebook PSID'}
            </label>
            <input className="form-input" value={channelId} onChange={(e) => setChannelId(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Nhãn (cách nhau bằng dấu phẩy)</label>
            <input
              className="form-input"
              value={tags.join(', ')}
              onChange={(e) => setTags(e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
              placeholder="VIP, Newsletter"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Ghi chú</label>
            <textarea className="form-input min-h-[60px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
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

      <div className="flex gap-3 mb-4">
        <input
          className="form-input max-w-xs"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        {tagOptions.length > 0 && (
          <select
            className="form-input w-40"
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả nhãn</option>
            {tagOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Tên</th>
              <th className="text-left px-4 py-3 font-medium">Điện thoại</th>
              <th className="text-left px-4 py-3 font-medium">{channelLabel(platform)} ID</th>
              <th className="text-left px-4 py-3 font-medium">Nhãn</th>
              <th className="text-left px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Đang tải...
                </td>
              </tr>
            )}
            {!isLoading && subscribers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Chưa có người nhận.
                </td>
              </tr>
            )}
            {subscribers.map((sub) => {
              const idValue = isZalo ? sub.zaloUserId : sub.facebookPsid;
              const subTags = sub.tags ?? [];
              return (
                <tr key={sub.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{sub.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{sub.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-xs">{idValue ?? '—'}</td>
                  <td className="px-4 py-3">
                    {subTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {subTags.map((t) => (
                          <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-xs">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(sub)} className="p-1.5 rounded hover:bg-muted" title="Sửa">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Xóa người nhận này?')) deleteMutation.mutate(sub.id);
                        }}
                        className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Trang {meta.page} / {meta.totalPages} ({meta.total} tổng)
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
