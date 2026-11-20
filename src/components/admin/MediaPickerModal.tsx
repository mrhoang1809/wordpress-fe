"use client";

/**
 * MediaPickerModal
 *
 * A two-tab modal that lets the user either:
 *  - "Thư viện": browse & select an image already uploaded to the media library
 *  - "Tải lên":  upload a new image from their computer (with client-side
 *                preview & light compression before sending to BE)
 *
 * Usage:
 *   <MediaPickerModal open={open} onClose={() => setOpen(false)} onSelect={(item) => ...} />
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import { mediaApi } from "@/lib/api-client";
import { resolveMediaUrl } from "@/lib/utils";
import type { MediaItem, PaginatedResponse } from "@/types";
import { Upload, X, Check, Loader2, ImageIcon, Search } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: { id: string; url: string; altText?: string }) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ─── Upload Tab ───────────────────────────────────────────────────────────────

function UploadTab({ onUploaded }: { onUploaded: (item: MediaItem) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [compressing, setCompressing] = useState(false);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");

      setCompressing(true);
      let toUpload: File = file;

      // Client-side pre-compress: only for JPEG/PNG/WEBP over 500KB
      const isCompressible = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
      if (isCompressible && file.size > 500 * 1024) {
        try {
          toUpload = await imageCompression(file, {
            maxSizeMB: 2,          // 2MB max before BE does WebP conversion
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: file.type,
          });
        } catch {
          // If compression fails, just use the original
          toUpload = file;
        }
      }
      setCompressedSize(toUpload.size);
      setCompressing(false);

      return mediaApi.upload(toUpload, altText || file.name.replace(/\.[^.]+$/, ""));
    },
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: ["media-library"] });
      onUploaded(item);
      // Reset
      setFile(null);
      setPreview(null);
      setAltText("");
      setCompressedSize(null);
    },
  });

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setCompressedSize(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, []);

  // Revoke object URL on unmount / file change
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  return (
    <div className="p-5 space-y-4">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !file && inputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed transition-all cursor-pointer
          ${file
            ? "border-brand-300 bg-brand-50 cursor-default"
            : "border-slate-200 hover:border-brand-300 hover:bg-slate-50"
          }`}
      >
        {preview && file ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="preview"
              className="w-full h-56 object-contain rounded-2xl"
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setCompressedSize(null); }}
              className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow hover:bg-red-50 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-slate-600" />
            </button>
            {/* Size info */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 text-white text-[11px] font-bold px-2 py-1 rounded-lg">
              <span>Gốc: {fmtSize(file.size)}</span>
              {compressedSize && compressedSize < file.size && (
                <>
                  <span className="opacity-50">→</span>
                  <span className="text-green-300">
                    Sau nén: {fmtSize(compressedSize)}
                    {" "}({Math.round((1 - compressedSize / file.size) * 100)}% nhỏ hơn)
                  </span>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700">Kéo thả hoặc nhấn để chọn ảnh</p>
              <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WEBP, GIF · Tối đa 10MB</p>
              <p className="text-xs text-brand-600 mt-0.5">Ảnh sẽ được tự động tối ưu trước khi tải lên</p>
            </div>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {/* Alt text */}
      {file && (
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Mô tả ảnh (alt text)
          </label>
          <input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="VD: Ảnh đại diện bài viết về yoga..."
            lang="vi"
            autoComplete="off"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400 transition-colors"
          />
        </div>
      )}

      {/* Error */}
      {uploadMutation.isError && (
        <p className="text-sm text-red-600 font-medium">
          Tải lên thất bại. Vui lòng thử lại.
        </p>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          disabled={!file || uploadMutation.isPending || compressing}
          onClick={() => uploadMutation.mutate()}
          className="flex items-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          {uploadMutation.isPending || compressing ? (
            <><Loader2 className="w-4 h-4 animate-spin" />{compressing ? "Đang nén..." : "Đang tải lên..."}</>
          ) : (
            <><Upload className="w-4 h-4" />Tải lên</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Library Tab ──────────────────────────────────────────────────────────────

function LibraryTab({
  onSelect,
}: {
  onSelect: (item: MediaItem) => void;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<PaginatedResponse<MediaItem>>({
    queryKey: ["media-library", debouncedSearch],
    queryFn: ({ pageParam = 1 }) =>
      mediaApi.list({ page: pageParam as number, pageSize: 24, ...(debouncedSearch && { search: debouncedSearch }) }),
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
    initialPageParam: 1,
  });

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const items = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm ảnh theo tên..."
            className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-brand-400 transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
            <ImageIcon className="w-8 h-8" />
            <p className="text-sm">{debouncedSearch ? "Không tìm thấy ảnh phù hợp" : "Chưa có ảnh nào trong thư viện"}</p>
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-brand-500 transition-all focus:outline-none focus:border-brand-500"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveMediaUrl(item.url)}
                alt={item.altText ?? ""}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Hover overlay */}
              {hoveredId === item.id && (
                <div className="absolute inset-0 bg-brand-700/70 flex flex-col items-center justify-center gap-1 p-1">
                  <Check className="w-5 h-5 text-white" />
                  <span className="text-[10px] font-bold text-white text-center leading-tight line-clamp-2">
                    {item.altText || fmtSize(item.size)}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Infinite scroll trigger */}
        <div ref={loaderRef} className="h-4" />
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function MediaPickerModal({ open, onClose, onSelect }: MediaPickerModalProps) {
  const [tab, setTab] = useState<"library" | "upload">("library");
  const qc = useQueryClient();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const handleUploaded = (item: MediaItem) => {
    // Switch to library tab so user sees the uploaded image, then select it
    qc.invalidateQueries({ queryKey: ["media-library"] });
    onSelect({ id: item.id, url: item.url, altText: item.altText });
    onClose();
  };

  const handleLibrarySelect = (item: MediaItem) => {
    onSelect({ id: item.id, url: item.url, altText: item.altText });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setTab("library")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                tab === "library"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Thư viện
            </button>
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                tab === "upload"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Tải ảnh lên
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {tab === "library" ? (
            <LibraryTab onSelect={handleLibrarySelect} />
          ) : (
            <UploadTab onUploaded={handleUploaded} />
          )}
        </div>
      </div>
    </div>
  );
}
