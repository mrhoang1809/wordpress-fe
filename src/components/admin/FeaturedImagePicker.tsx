"use client";

/**
 * FeaturedImagePicker
 *
 * Shared sidebar widget used in both /posts/new and /posts/[id]/edit.
 * Clicking the widget opens a MediaPickerModal where the user can:
 *   - pick an existing image from the media library, or
 *   - upload a new one from their computer (client-side optimised).
 */

import { useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import { resolveMediaUrl } from "@/lib/utils";
import { MediaPickerModal } from "./MediaPickerModal";

interface FeaturedImagePickerProps {
  value: { id: string; url: string; altText?: string } | null;
  onChange: (img: { id: string; url: string; altText?: string } | null) => void;
}

export function FeaturedImagePicker({ value, onChange }: FeaturedImagePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
          <ImageIcon className="w-3.5 h-3.5 inline mr-1.5 text-brand-600" />
          Ảnh đại diện
        </label>

        {value ? (
          <div className="relative group rounded-xl overflow-hidden border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveMediaUrl(value.url)}
              alt={value.altText ?? "Ảnh đại diện"}
              className="w-full h-44 object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> Đổi ảnh
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="flex items-center gap-1.5 bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Xóa
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full h-36 rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-400 bg-slate-50 hover:bg-brand-50 flex flex-col items-center justify-center gap-2 transition-all"
          >
            <Upload className="w-8 h-8 text-slate-300" />
            <span className="text-xs text-slate-500 font-medium">
              Chọn từ thư viện hoặc tải ảnh mới
            </span>
            <span className="text-[10px] text-slate-400">
              JPEG, PNG, WEBP · Tự động tối ưu
            </span>
          </button>
        )}
      </div>

      <MediaPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(item) => {
          onChange(item);
          setOpen(false);
        }}
      />
    </>
  );
}
