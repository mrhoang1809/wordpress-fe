"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { locationsApi } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth.store";
import type { PaginatedResponse, Location } from "@/types";
import { formatDate } from "@/lib/utils";
import { DEMO_LOCATIONS } from "@/lib/demo-content";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Mail,
  MapPinOff,
} from "lucide-react";

export interface LocationForm {
  name: string;
  slug: string;
  address: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  order: number;
  isActive: boolean;
}

const DEFAULT_FORM: LocationForm = {
  name: "",
  slug: "",
  address: "",
  phone: "",
  email: "",
  latitude: undefined,
  longitude: undefined,
  order: 0,
  isActive: true,
};

export default function LocationsAdminPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<LocationForm>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<Location>>({
    queryKey: ["admin-locations", user?.id],
    queryFn: () => locationsApi.list({ pageSize: 50 }),
    enabled: !!user,
    placeholderData: {
      data: DEMO_LOCATIONS,
      meta: { total: DEMO_LOCATIONS.length, page: 1, pageSize: 50, totalPages: 1 },
    },
  });

  const createMutation = useMutation({
    mutationFn: () => locationsApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-locations"] });
      setEditing(null);
    },
    onError: (e) =>
      setError(e instanceof Error ? e.message : "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => locationsApi.update(id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-locations"] });
      setEditing(null);
    },
    onError: (e) =>
      setError(e instanceof Error ? e.message : "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => locationsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-locations"] }),
  });

  const openNew = () => {
    setForm(DEFAULT_FORM);
    setError(null);
    setEditing("new");
  };

  const openEdit = (location: Location) => {
    setForm({
      name: location.name,
      slug: location.slug,
      address: location.address,
      phone: location.phone ?? "",
      email: location.email ?? "",
      latitude: location.latitude ?? undefined,
      longitude: location.longitude ?? undefined,
      order: location.order,
      isActive: location.isActive,
    });
    setError(null);
    setEditing(location.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.slug || !form.address) {
      setError("Name, slug, and address are required");
      return;
    }
    if (editing === "new") createMutation.mutate();
    else if (editing) updateMutation.mutate(editing);
  };

  const locations = data?.data?.length ? data.data : DEMO_LOCATIONS;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Locations / Chi Nhánh</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý địa chỉ chi nhánh, hiển thị trên trang chi nhánh.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Thêm Chi Nhánh
        </button>
      </div>

      {/* Form */}
      {editing && (
        <div className="mb-8 rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-semibold text-base">
              {editing === "new"
                ? "+ Tạo chi nhánh mới"
                : "✏️ Chỉnh sửa chi nhánh"}
            </h2>
            <button
              onClick={() => setEditing(null)}
              className="p-1 rounded hover:bg-muted"
            >
              <span className="text-xl text-muted-foreground">✕</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Tên chi nhánh <span className="text-destructive">*</span>
                </label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Chi nhánh Quận 1"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Slug <span className="text-destructive">*</span>
                </label>
                <input
                  className="form-input"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="chi-nhanh-quan-1"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Địa chỉ <span className="text-destructive">*</span>
              </label>
              <textarea
                className="form-input min-h-[60px]"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="123 Đường Nguyễn Văn Cừ, Quận 1, TP.HCM"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Điện thoại
                </label>
                <input
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="02812345678"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Email
                </label>
                <input
                  className="form-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="quanchuan1@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Order
                </label>
                <input
                  type="number"
                  min={0}
                  className="form-input"
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Trạng thái
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) =>
                        setForm({ ...form, isActive: e.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    Đang hoạt động
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Đang lưu..."
                  : editing === "new"
                    ? "Tạo Chi Nhánh"
                    : "Lưu thay đổi"}
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

      {/* List */}
      {isLoading && <p className="text-muted-foreground">Đang tải...</p>}

      <div className="grid gap-4">
        {locations.map((location) => (
          <div
            key={location.id}
            className="rounded-xl border bg-card p-5 flex flex-col sm:flex-row justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {location.isActive ? (
                  <MapPin className="h-4 w-4 text-green-600" />
                ) : (
                  <MapPinOff className="h-4 w-4 text-slate-400" />
                )}
                <h3 className="font-bold text-base">{location.name}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${location.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
                >
                  {location.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                </span>
              </div>
              <p className="text-sm text-slate-600">{location.address}</p>
              {(location.phone || location.email) && (
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                  {location.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {location.phone}
                    </span>
                  )}
                  {location.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {location.email}
                    </span>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Slug: {location.slug} · Order: {location.order}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openEdit(location)}
                className="p-2 rounded hover:bg-muted"
                title="Chỉnh sửa"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Xoá "${location.name}"?`)) {
                    deleteMutation.mutate(location.id);
                  }
                }}
                className="p-2 rounded hover:bg-destructive/10 hover:text-destructive"
                title="Xoá"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {!isLoading && locations.length === 0 && (
          <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
            <MapPinOff className="h-12 w-12 mx-auto mb-3 text-slate-400" />
            <p className="text-base font-medium mb-2">Chưa có chi nhánh nào</p>
            <p className="text-sm">
              Nhấn &ldquo;Thêm Chi Nhánh&rdquo; để tạo vị trí mới.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
