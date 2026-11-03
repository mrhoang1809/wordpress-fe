"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi, trialRegistrationsApi } from "@/lib/api-client";
import type {
  SiteSetting,
  TrialRegistration,
  PaginatedResponse,
} from "@/types";
import { formatDate } from "@/lib/utils";
import {
  Save,
  CheckCircle,
  Phone,
  MessageCircle,
  Facebook,
  Mail,
  Users,
  Settings2,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";

type Tab = "general" | "registrations";

// ─── Registrations list ───────────────────────────────────────────────────────

function RegistrationsList() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery<PaginatedResponse<TrialRegistration>>({
    queryKey: ["trial-registrations", page],
    queryFn: () => trialRegistrationsApi.list({ page, pageSize: 20 }),
  });

  const rows = data?.data ?? [];
  const meta = data?.meta;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl skeleton" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 p-12 text-center">
        <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="text-slate-500 font-medium">Chưa có đăng ký nào.</p>
        <p className="text-xs text-slate-400 mt-1">
          Khi có người điền form, danh sách sẽ hiển thị ở đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Tổng cộng <strong>{meta?.total ?? 0}</strong> đăng ký
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wide">
                Họ và tên
              </th>
              <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wide">
                SĐT
              </th>
              <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wide">
                Chi nhánh
              </th>
              <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wide">
                Nguồn
              </th>
              <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wide">
                Thời gian
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-800">
                  {r.name}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`tel:${r.phone}`}
                    className="text-brand-700 font-bold hover:underline"
                  >
                    {r.phone}
                  </a>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {r.location ? (
                    <span className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-brand-400" />
                      <span>
                        <span className="font-medium">{r.location.name}</span>
                        <span className="block text-[11px] text-slate-400 leading-tight">
                          {r.location.address}
                        </span>
                      </span>
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {r.source ? (
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      {r.source}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {formatDate(r.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Trang {meta.page} / {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-200 hover:border-brand-300 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="p-2 rounded-lg border border-slate-200 hover:border-brand-300 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Settings form ────────────────────────────────────────────────────────────

function SettingsForm() {
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [defaultSeoTitle, setDefaultSeoTitle] = useState("");
  const [defaultSeoDescription, setDefaultSeoDescription] = useState("");
  const [hotline, setHotline] = useState("");
  const [zaloUrl, setZaloUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [trialNotifyEmail, setTrialNotifyEmail] = useState("");
  const [saved, setSaved] = useState(false);

  const qc = useQueryClient();
  const { data, isLoading } = useQuery<SiteSetting>({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<SiteSetting>) => settingsApi.update(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  useEffect(() => {
    if (!data) return;
    setSiteName(data.siteName ?? "");
    setSiteDescription(data.siteDescription ?? "");
    setDefaultSeoTitle(data.defaultSeoTitle ?? "");
    setDefaultSeoDescription(data.defaultSeoDescription ?? "");
    setHotline(data.hotline ?? "");
    setZaloUrl(data.zaloUrl ?? "");
    setFacebookUrl(data.facebookUrl ?? "");
    setTrialNotifyEmail(data.trialNotifyEmail ?? "");
  }, [data]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      siteName,
      siteDescription,
      defaultSeoTitle,
      defaultSeoDescription,
      hotline: hotline || undefined,
      zaloUrl: zaloUrl || undefined,
      facebookUrl: facebookUrl || undefined,
      trialNotifyEmail: trialNotifyEmail || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 rounded-xl skeleton" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-10">
      {/* General */}
      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-brand-700 border-b border-brand-100 pb-2">
          Thông Tin Chung
        </h2>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Tên trang
          </label>
          <input
            className="form-input"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Curves Vietnam"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Mô tả trang
          </label>
          <textarea
            className="form-input min-h-[80px]"
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            placeholder="Chuỗi phòng tập dành riêng cho phụ nữ..."
          />
        </div>
      </section>

      {/* SEO */}
      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-brand-700 border-b border-brand-100 pb-2">
          SEO Mặc Định
        </h2>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Tiêu đề SEO mặc định
          </label>
          <input
            className="form-input"
            value={defaultSeoTitle}
            onChange={(e) => setDefaultSeoTitle(e.target.value)}
            placeholder="Curves Vietnam — Phòng tập 30 phút dành cho phụ nữ"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Mô tả SEO mặc định
          </label>
          <textarea
            className="form-input min-h-[60px]"
            value={defaultSeoDescription}
            onChange={(e) => setDefaultSeoDescription(e.target.value)}
            placeholder="Hệ thống phòng tập 30 phút độc quyền dành cho phụ nữ..."
          />
        </div>
      </section>

      {/* Contact buttons */}
      <section className="space-y-4">
        <div className="border-b border-brand-100 pb-2">
          <h2 className="text-sm font-black uppercase tracking-widest text-brand-700">
            Nút Liên Hệ Nổi (Float Buttons)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Hiển thị góc dưới trái. Để trống dùng giá trị mặc định.
          </p>
        </div>
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
            <Phone className="w-3.5 h-3.5 text-emerald-600" /> Hotline
          </label>
          <input
            className="form-input"
            value={hotline}
            onChange={(e) => setHotline(e.target.value)}
            placeholder="19006363"
            type="tel"
          />
          <p className="text-[11px] text-muted-foreground">
            Chỉ nhập số, không dấu cách.
          </p>
        </div>
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
            <MessageCircle className="w-3.5 h-3.5 text-blue-600" /> Link Zalo
          </label>
          <input
            className="form-input"
            value={zaloUrl}
            onChange={(e) => setZaloUrl(e.target.value)}
            placeholder="https://zalo.me/19006363"
            type="url"
          />
        </div>
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
            <Facebook className="w-3.5 h-3.5 text-blue-700" /> Link Facebook
            Messenger
          </label>
          <input
            className="form-input"
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            placeholder="https://m.me/curvesvietnam"
            type="url"
          />
        </div>
      </section>

      {/* Trial notify email */}
      <section className="space-y-4">
        <div className="border-b border-brand-100 pb-2">
          <h2 className="text-sm font-black uppercase tracking-widest text-brand-700">
            Email Nhận Đăng Ký Tập Thử
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Mỗi khi có người đăng ký tập thử, hệ thống sẽ gửi email thông báo
            đến địa chỉ này.
          </p>
        </div>
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
            <Mail className="w-3.5 h-3.5 text-brand-600" /> Email nhận thông báo
          </label>
          <input
            className="form-input"
            value={trialNotifyEmail}
            onChange={(e) => setTrialNotifyEmail(e.target.value)}
            placeholder="hlv@curves.vn"
            type="email"
          />
          <p className="text-[11px] text-muted-foreground">
            Để trống nếu không muốn nhận email. Cần cấu hình SMTP ở server (biến
            môi trường{" "}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">
              SMTP_HOST
            </code>
            ,{" "}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">
              SMTP_USER
            </code>
            ,{" "}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">
              SMTP_PASS
            </code>
            ).
          </p>
        </div>

        {/* Demo email preview */}
        {trialNotifyEmail && (
          <div className="rounded-xl bg-gradient-to-br from-brand-50 to-pink-50 border border-brand-200/60 p-4 space-y-1">
            <p className="text-xs font-bold text-brand-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email thông báo sẽ gửi đến
            </p>
            <p className="text-sm font-black text-brand-950">
              {trialNotifyEmail}
            </p>
            <p className="text-[11px] text-slate-500">
              Tiêu đề: [Curves] Đăng ký tập thử: &lt;tên khách&gt; — &lt;chi
              nhánh&gt;
            </p>
          </div>
        )}
      </section>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 px-6 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? "Đang lưu..." : "Lưu Cài Đặt"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
            <CheckCircle className="w-4 h-4" /> Đã lưu!
          </span>
        )}
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("general");

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-brand-950">Cài Đặt Trang</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Thông tin chung, liên hệ, email thông báo và danh sách đăng ký.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-8 w-fit">
        <button
          onClick={() => setTab("general")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            tab === "general"
              ? "bg-white text-brand-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" /> Cài Đặt
        </button>
        <button
          onClick={() => setTab("registrations")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            tab === "registrations"
              ? "bg-white text-brand-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Danh Sách Đăng Ký
        </button>
      </div>

      {tab === "general" ? <SettingsForm /> : <RegistrationsList />}
    </div>
  );
}
