"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth.store";
import type { Category, PaginatedResponse } from "@/types";
import { slugify } from "@/lib/utils";
import { Plus, Trash2, Pencil, FolderTree } from "lucide-react";

export default function CategoriesPage() {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const qc = useQueryClient();
  const { data, isLoading } = useQuery<PaginatedResponse<Category>>({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Category>) => categoriesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      resetForm();
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Tạo thất bại"),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      resetForm();
    },
    onError: (e) =>
      setError(e instanceof Error ? e.message : "Cập nhật thất bại"),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    onError: (e) => alert(e instanceof Error ? e.message : "Xóa thất bại"),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setName("");
    setSlug("");
    setDescription("");
    setParentId("");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const data = {
      name,
      slug: slug || slugify(name),
      description,
      parentId: parentId || undefined,
    };
    if (editId) {
      updateMutation.mutate({ id: editId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description ?? "");
    setParentId(cat.parentId ?? "");
    setShowForm(true);
  };

  const categories = data?.data ?? [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Danh mục</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Danh mục mới
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-lg border bg-card p-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Tên
              </label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) setSlug(slugify(e.target.value));
                }}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Đường dẫn
              </label>
              <input
                className="form-input"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Mô tả
            </label>
            <textarea
              className="form-input min-h-[60px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Danh mục cha
            </label>
            <select
              className="form-input"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">Không (cấp cao nhất)</option>
              {categories
                .filter((c) => c.id !== editId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
            >
              {editId ? "Cập nhật" : "Tạo"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Tên</th>
              <th className="text-left px-4 py-3 font-medium">Đường dẫn</th>
              <th className="text-left px-4 py-3 font-medium">Mô tả</th>
              <th className="text-left px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Đang tải...
                </td>
              </tr>
            )}
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">
                  <span className="flex items-center gap-2">
                    <FolderTree className="h-4 w-4 text-muted-foreground" />
                    {cat.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{cat.slug}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                  {cat.description ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-1.5 rounded hover:bg-muted"
                      title="Sửa"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Xóa "${cat.name}"?`))
                          deleteMutation.mutate(cat.id);
                      }}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
