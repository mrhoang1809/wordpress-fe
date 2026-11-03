'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promotionsApi } from '@/lib/api-client';
import type { PaginatedResponse, PromotionBanner } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Plus,
  Pencil,
  Trash2,
  ToggleRight,
  ToggleLeft,
  Eye,
  EyeOff,
  X,
  Save,
} from 'lucide-react';

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  badgeText: string;
  headline: string;
  description: string;
  ctaLabel: string;
  ctaSource: string;
  countdownLabel: string;
  endsAt: string;           // datetime-local string
  bgGradientFrom: string;
  bgGradientVia: string;
  bgGradientTo: string;
  badgeBg: string;
  badgeText2: string;
  sortOrder: number;
}

const DEFAULT_FORM: FormState = {
  badgeText: 'Ưu Đãi Đặc Biệt',
  headline: '',
  description: '',
  ctaLabel: '🎁 ĐĂNG KÝ NHẬN VOUCHER NGAY',
  ctaSource: 'Promotion Banner',
  countdownLabel: 'Chương trình kết thúc sau:',
  endsAt: '',
  bgGradientFrom: 'from-brand-900',
  bgGradientVia: 'via-brand-800',
  bgGradientTo: 'to-accent-magenta',
  badgeBg: 'bg-yellow-400',
  badgeText2: 'text-brand-900',
  sortOrder: 0,
};

// Convert ISO string → datetime-local value (trims seconds)
function toDatetimeLocal(iso: string): string {
  if (!iso) return '';
  return iso.slice(0, 16); // "YYYY-MM-DDTHH:mm"
}

// Convert datetime-local → ISO string
function fromDatetimeLocal(val: string): string {
  if (!val) return '';
  return new Date(val).toISOString();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PromotionsAdminPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null); // banner id or 'new'
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<PromotionBanner>>({
    queryKey: ['admin-promotions'],
    queryFn: () => promotionsApi.list({ pageSize: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      promotionsApi.create({ ...form, endsAt: fromDatetimeLocal(form.endsAt) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-promotions'] }); setEditing(null); },
    onError: (e) => setError(e instanceof Error ? e.message : 'Failed to create'),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) =>
      promotionsApi.update(id, { ...form, endsAt: fromDatetimeLocal(form.endsAt) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-promotions'] }); setEditing(null); },
    onError: (e) => setError(e instanceof Error ? e.message : 'Failed to update'),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => promotionsApi.activate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-promotions'] }),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => promotionsApi.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-promotions'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => promotionsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-promotions'] }),
  });

  const openNew = () => {
    setForm(DEFAULT_FORM);
    setError(null);
    setEditing('new');
  };

  const openEdit = (banner: PromotionBanner) => {
    setForm({
      badgeText: banner.badgeText,
      headline: banner.headline,
      description: banner.description ?? '',
      ctaLabel: banner.ctaLabel,
      ctaSource: banner.ctaSource,
      countdownLabel: banner.countdownLabel,
      endsAt: toDatetimeLocal(banner.endsAt),
      bgGradientFrom: banner.bgGradientFrom,
      bgGradientVia: banner.bgGradientVia,
      bgGradientTo: banner.bgGradientTo,
      badgeBg: banner.badgeBg,
      badgeText2: banner.badgeText2,
      sortOrder: banner.sortOrder,
    });
    setError(null);
    setEditing(banner.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.endsAt) { setError('Vui lòng chọn ngày kết thúc'); return; }
    if (editing === 'new') createMutation.mutate();
    else if (editing) updateMutation.mutate(editing);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const banners = data?.data ?? [];

  return (
    <div className="p-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Promotion Banners</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý banner đếm ngược trên trang chủ. Chỉ một banner được kích hoạt tại một thời điểm.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Thêm Banner
        </button>
      </div>

      {/* ── Form ───────────────────────────────────────────────────────────── */}
      {editing && (
        <div className="mb-8 rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-semibold text-base">
              {editing === 'new' ? '+ Tạo banner mới' : '✏️ Chỉnh sửa banner'}
            </h2>
            <button onClick={() => setEditing(null)} className="p-1 rounded hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Badge Text <span className="text-destructive">*</span>
                </label>
                <input
                  className="form-input"
                  value={form.badgeText}
                  onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                  placeholder="Ưu Đãi Tháng 10"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Ngày kết thúc <span className="text-destructive">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Tiêu đề chính (Headline) <span className="text-destructive">*</span>
              </label>
              <input
                className="form-input"
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                placeholder="Tặng 01 Buổi Phân Tích InBody & 3 Ngày Tập Thử Miễn Phí"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Mô tả (tuỳ chọn)
              </label>
              <textarea
                className="form-input min-h-[80px]"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Nhận ngay gói trải nghiệm toàn bộ máy kháng thủy lực..."
              />
            </div>

            {/* CTA + countdown label */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Nhãn nút CTA
                </label>
                <input
                  className="form-input"
                  value={form.ctaLabel}
                  onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                  placeholder="🎁 ĐĂNG KÝ NHẬN VOUCHER NGAY"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Label đếm ngược
                </label>
                <input
                  className="form-input"
                  value={form.countdownLabel}
                  onChange={(e) => setForm({ ...form, countdownLabel: e.target.value })}
                  placeholder="Chương trình kết thúc sau:"
                />
              </div>
            </div>

            {/* CTA source */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                CTA Source (analytics)
              </label>
              <input
                className="form-input"
                value={form.ctaSource}
                onChange={(e) => setForm({ ...form, ctaSource: e.target.value })}
                placeholder="Banner Promo October"
              />
            </div>

            {/* Gradient */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-2">
                Màu nền (Tailwind gradient classes)
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">From</span>
                  <input
                    className="form-input"
                    value={form.bgGradientFrom}
                    onChange={(e) => setForm({ ...form, bgGradientFrom: e.target.value })}
                    placeholder="from-brand-900"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">Via</span>
                  <input
                    className="form-input"
                    value={form.bgGradientVia}
                    onChange={(e) => setForm({ ...form, bgGradientVia: e.target.value })}
                    placeholder="via-brand-800"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">To</span>
                  <input
                    className="form-input"
                    value={form.bgGradientTo}
                    onChange={(e) => setForm({ ...form, bgGradientTo: e.target.value })}
                    placeholder="to-accent-magenta"
                  />
                </div>
              </div>
            </div>

            {/* Badge colours */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Badge BG</label>
                <input
                  className="form-input"
                  value={form.badgeBg}
                  onChange={(e) => setForm({ ...form, badgeBg: e.target.value })}
                  placeholder="bg-yellow-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Badge Text colour</label>
                <input
                  className="form-input"
                  value={form.badgeText2}
                  onChange={(e) => setForm({ ...form, badgeText2: e.target.value })}
                  placeholder="text-brand-900"
                />
              </div>
            </div>

            {/* Sort order */}
            <div className="space-y-1 w-32">
              <label className="text-xs font-bold text-muted-foreground uppercase">Sort Order</label>
              <input
                type="number"
                min={0}
                className="form-input"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </div>

            {/* Preview strip */}
            <div
              className={`rounded-xl px-4 py-3 bg-gradient-to-r ${form.bgGradientFrom} ${form.bgGradientVia} ${form.bgGradientTo} text-white text-sm`}
            >
              <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${form.badgeBg} ${form.badgeText2} mr-2`}>
                {form.badgeText || 'Badge'}
              </span>
              <span className="font-bold">{form.headline || 'Headline...'}</span>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Đang lưu...' : editing === 'new' ? 'Tạo Banner' : 'Lưu thay đổi'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Huỷ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── List ───────────────────────────────────────────────────────────── */}
      {isLoading && <p className="text-muted-foreground">Đang tải...</p>}

      <div className="grid gap-4">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-md ${banner.isActive ? 'border-green-300 ring-1 ring-green-300/50' : ''}`}
          >
            {/* Preview strip */}
            <div
              className={`h-2 bg-gradient-to-r ${banner.bgGradientFrom} ${banner.bgGradientVia} ${banner.bgGradientTo}`}
            />

            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${banner.badgeBg} ${banner.badgeText2}`}>
                    {banner.badgeText}
                  </span>
                  {banner.isActive ? (
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      ✓ Đang kích hoạt
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Không hoạt động
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-base truncate">{banner.headline}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Kết thúc: {formatDate(banner.endsAt)} · Sort: {banner.sortOrder}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(banner)}
                  className="p-1.5 rounded hover:bg-muted"
                  title="Chỉnh sửa"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                {banner.isActive ? (
                  <button
                    onClick={() => deactivateMutation.mutate(banner.id)}
                    className="p-1.5 rounded hover:bg-muted text-green-600 hover:text-slate-600"
                    title="Tắt hiển thị"
                  >
                    <EyeOff className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => activateMutation.mutate(banner.id)}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-green-600"
                    title="Kích hoạt trên trang chủ"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={() => {
                    if (confirm(`Xoá banner "${banner.headline}"?`)) {
                      deleteMutation.mutate(banner.id);
                    }
                  }}
                  className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  title="Xoá"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!isLoading && banners.length === 0 && (
          <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
            <p className="text-base font-medium mb-2">Chưa có banner nào</p>
            <p className="text-sm">Nhấn &ldquo;Thêm Banner&rdquo; để tạo banner đếm ngược đầu tiên.</p>
          </div>
        )}
      </div>

      {/* Hint */}
      <div className="mt-6 rounded-lg bg-muted/40 border p-4 text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground">💡 Hướng dẫn:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Nhấn <Eye className="h-3 w-3 inline mx-0.5" /> để kích hoạt banner — các banner khác sẽ tự tắt.</li>
          <li>Gradient sử dụng Tailwind class: <code>from-brand-900 via-brand-800 to-accent-magenta</code>.</li>
          <li>Banner sẽ tự ẩn trên trang chủ khi <strong>endsAt</strong> đã qua.</li>
          <li>Chỉnh sửa banner đang active sẽ cập nhật ngay trên trang chủ.</li>
        </ul>
      </div>
    </div>
  );
}
