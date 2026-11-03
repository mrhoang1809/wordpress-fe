"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef } from "react";
import { mediaApi } from "@/lib/api-client";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// ─── Toolbar helpers ──────────────────────────────────────────────────────────

function ToolBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded-md text-sm transition-colors",
        active
          ? "bg-brand-700 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        disabled && "opacity-30 cursor-not-allowed",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-slate-200 mx-0.5 shrink-0" />;
}

// ─── TiptapEditor ─────────────────────────────────────────────────────────────

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function TiptapEditor({
  value,
  onChange,
  placeholder = "Bắt đầu viết nội dung...",
  minHeight = "min-h-[320px]",
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-600 underline underline-offset-2",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-xl max-w-full h-auto my-4 shadow-sm",
          loading: "lazy",
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-slate max-w-none text-sm leading-relaxed outline-none px-4 py-3",
          minHeight,
          "[&_a]:text-brand-600 [&_a]:underline",
          "[&_img]:rounded-xl [&_img]:max-w-full [&_img]:shadow-sm",
          "[&_.is-editor-empty:first-child::before]:text-slate-400",
          "[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
          "[&_.is-editor-empty:first-child::before]:float-left",
          "[&_.is-editor-empty:first-child::before]:pointer-events-none",
          "[&_.is-editor-empty:first-child::before]:h-0",
        ),
      },
    },
  });

  if (!editor) return null;

  // ── Link ──────────────────────────────────────────────────────────
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Nhập URL:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  // ── Image upload ──────────────────────────────────────────────────
  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploadingImage(true);
    try {
      const media = await mediaApi.upload(
        file,
        file.name.replace(/\.[^.]+$/, ""),
      );
      editor
        .chain()
        .focus()
        .setImage({ src: media.url, alt: media.altText ?? "" })
        .run();
    } catch {
      alert("Upload ảnh thất bại. Vui lòng thử lại.");
    } finally {
      setUploadingImage(false);
    }
  };

  const insertImageFromUrl = () => {
    const url = window.prompt("Nhập URL ảnh:");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-400 transition-all">
      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50">
        {/* History */}
        <ToolBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Làm lại (Ctrl+Y)"
        >
          <Redo className="w-3.5 h-3.5" />
        </ToolBtn>
        <Divider />

        {/* Headings */}
        <ToolBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="Tiêu đề 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Tiêu đề 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Tiêu đề 3"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </ToolBtn>
        <Divider />

        {/* Marks */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Đậm (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Nghiêng (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Gạch dưới (Ctrl+U)"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Gạch ngang"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolBtn>
        <Divider />

        {/* Align */}
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Căn trái"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Căn giữa"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Căn phải"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          title="Căn đều"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </ToolBtn>
        <Divider />

        {/* Lists */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Danh sách"
        >
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Danh sách số"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Trích dẫn"
        >
          <Quote className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          active={false}
          title="Đường kẻ ngang"
        >
          <Minus className="w-3.5 h-3.5" />
        </ToolBtn>
        <Divider />

        {/* Link */}
        <ToolBtn
          onClick={setLink}
          active={editor.isActive("link")}
          title="Chèn liên kết"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
          title="Xóa liên kết"
        >
          <Unlink className="w-3.5 h-3.5" />
        </ToolBtn>
        <Divider />

        {/* Image */}
        <ToolBtn
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          title="Chèn ảnh từ máy tính (tự động tối ưu WebP)"
          active={false}
        >
          {uploadingImage ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5" />
          )}
        </ToolBtn>
        <ToolBtn
          onClick={insertImageFromUrl}
          disabled={uploadingImage}
          title="Chèn ảnh từ URL"
          active={false}
        >
          <span className="text-[10px] font-black leading-none">URL</span>
        </ToolBtn>

        {/* Word count */}
        <span className="ml-auto text-[10px] text-slate-400 pr-1 shrink-0">
          {editor.getText().trim().split(/\s+/).filter(Boolean).length} từ
        </span>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageFile(file);
          e.target.value = "";
        }}
      />

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
