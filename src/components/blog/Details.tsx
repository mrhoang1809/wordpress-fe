"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PublicPost, PublicPostCard, PublicPostEngagement } from "@/types";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { formatDate } from "@/lib/utils";
import { Clock, Eye, ArrowLeft, Heart, Share2, Copy } from "lucide-react";
import { useTrialModal } from "@/components/home/TrialRegistrationModal";
import { publicApi } from "@/lib/api-client";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readingTime(post: PublicPost): string {
  const wordCount = post.blocks.reduce((acc, b) => {
    const text = JSON.stringify(b.data);
    return acc + text.split(/\s+/).length;
  }, 0);
  const mins = Math.max(1, Math.ceil(wordCount / 200));
  return `${mins} phút đọc`;
}

// ─── Table of contents — naive extract from RICH_TEXT blocks ─────────────────

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractToc(post: PublicPost): TocItem[] {
  const items: TocItem[] = [];
  post.blocks.forEach((b) => {
    if (b.type !== "RICH_TEXT") return;
    const doc = (b.data as { content?: { content?: unknown[] } }).content;
    if (!doc?.content) return;
    (
      doc.content as Array<{
        type?: string;
        attrs?: { level?: number };
        content?: Array<{ text?: string }>;
      }>
    )
      .filter((n) => n.type === "heading")
      .forEach((n, i) => {
        const text = (n.content ?? []).map((t) => t.text ?? "").join("");
        if (text)
          items.push({ id: `toc-${i}`, text, level: n.attrs?.level ?? 2 });
      });
  });
  return items;
}

// ─── Comment types ────────────────────────────────────────────────────────────

// ─── Main BlogDetails component ───────────────────────────────────────────────

export interface BlogDetailsProps {
  post: PublicPost;
  relatedPosts: PublicPostCard[];
}

export function BlogDetails({ post, relatedPosts }: BlogDetailsProps) {
  const { open } = useTrialModal();
  const queryClient = useQueryClient();
  const hasRecordedView = useRef(false);
  const [liked, setLiked] = useState(false);
  const [fontSize, setFontSize] = useState(16); // px
  /*
    {
      id: "1",
      name: "Chị Thu Thủy",
      text: "Bài viết rất bổ ích! Mọi khi mình hay bỏ bữa sáng vì bận việc, đọc xong bài này sẽ điều chỉnh lại ngay.",
      time: "2 giờ trước",
    },
  */
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [copied, setCopied] = useState(false);

  const engagementKey = ["post-engagement", post.slug] as const;
  const { data: engagement } = useQuery<PublicPostEngagement>({
    queryKey: engagementKey,
    queryFn: () => publicApi.getPostEngagement(post.slug),
    initialData: {
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      comments: [],
    },
  });
  const likeMutation = useMutation({
    mutationFn: () => publicApi.likePost(post.slug),
    onSuccess: (data) => queryClient.setQueryData(engagementKey, data),
    onError: () => setLiked(false),
  });
  const commentMutation = useMutation({
    mutationFn: (input: { name: string; text: string }) =>
      publicApi.createPostComment(post.slug, input),
    onSuccess: (data) => {
      queryClient.setQueryData(engagementKey, data);
      setCommentName("");
      setCommentText("");
      setCommentError("");
    },
    onError: () => setCommentError("Không thể gửi bình luận. Vui lòng thử lại."),
  });

  useEffect(() => {
    if (hasRecordedView.current) return;
    hasRecordedView.current = true;
    publicApi.recordPostView(post.slug)
      .then((data) => queryClient.setQueryData(engagementKey, data))
      .catch(() => {});
  }, [engagementKey, post.slug, queryClient]);

  const toc = extractToc(post);
  const category = post.categories[0];

  const handleLike = () => {
    if (liked || likeMutation.isPending) return;
    setLiked(true);
    likeMutation.mutate();
  };

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({ title: post.title, url: window.location.href })
        .catch(() => {});
    } else {
      handleCopy();
    }
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;
    /*
      ...prev,
      {
        id: Date.now().toString(),
        name: commentName,
        text: commentText,
        time: "Vừa xong",
      },
    */
    setCommentError("");
    commentMutation.mutate({ name: commentName, text: commentText });
  };

  return (
    <>
      {/* ── Article Header Hero ──────────────────────────────────────────── */}
      <div className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-300 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Trở về danh sách bài viết
          </Link>

          {category && (
            <div className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-accent-magenta text-white">
              {category.name}
            </div>
          )}

          <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight text-white">
            {post.title}
          </h1>

          {/* Author & meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-black text-base">
                {post.author ? post.author.firstName.charAt(0) : "C"}
              </div>
              <div>
                <span className="font-bold text-white block">
                  {post.author
                    ? `${post.author.firstName} ${post.author.lastName}`
                    : "Chuyên Gia Curves"}
                </span>
                <span className="text-slate-400">
                  {formatDate(post.publishedAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-slate-300">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-brand-400" />
                {readingTime(post)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-brand-400" />
                {engagement.viewCount.toLocaleString()} lượt
                xem
              </span>
              {/* Font-size controls */}
              <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold mr-1">
                  Cỡ chữ:
                </span>
                <button
                  onClick={() => setFontSize((s) => Math.max(12, s - 1))}
                  className="w-6 h-6 hover:bg-slate-700 rounded font-bold text-xs flex items-center justify-center"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize((s) => Math.min(22, s + 1))}
                  className="w-6 h-6 hover:bg-slate-700 rounded font-bold text-xs flex items-center justify-center"
                >
                  A+
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body + Sidebar ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* ── Left: Article body ─────────────────────────────────────── */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-100 space-y-6">
              {/* Hero image */}
              {post.featuredImage?.url && (
                <div className="rounded-2xl overflow-hidden h-72 sm:h-96 w-full shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.featuredImage.url}
                    alt={post.featuredImage.altText ?? post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Table of contents */}
              {toc.length > 0 && (
                <div className="bg-brand-50 p-5 rounded-2xl border border-brand-100">
                  <h4 className="font-bold text-brand-900 text-sm flex items-center gap-2 mb-3">
                    📋 Mục Lục Bài Viết
                  </h4>
                  <ul className="text-xs space-y-2 text-slate-700 font-medium">
                    {toc.map((item, i) => (
                      <li
                        key={item.id}
                        style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
                      >
                        <a
                          href={`#${item.id}`}
                          className="hover:text-brand-800 hover:underline"
                        >
                          {i + 1}. {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Block content */}
              <div
                style={{ fontSize: `${fontSize}px` }}
                className="prose prose-purple max-w-none text-slate-700 leading-relaxed transition-all"
              >
                <BlockRenderer blocks={post.blocks} />
              </div>

              {/* ── Engagement bar ────────────────────────────────────── */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={handleLike}
                  className={`border font-bold px-4 py-2 rounded-full text-xs flex items-center gap-2 transition-colors ${
                    liked
                      ? "bg-pink-100 border-accent-magenta text-accent-magenta"
                      : "bg-pink-50 border-pink-200 text-accent-magenta hover:bg-pink-100"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                  {engagement.likeCount} Lượt thích
                </button>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span>Chia sẻ:</span>
                  <button
                    onClick={handleShare}
                    className="p-2 bg-slate-100 hover:bg-brand-100 text-slate-700 hover:text-brand-800 rounded-full transition-colors"
                    title="Chia sẻ"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-slate-100 hover:bg-brand-100 text-slate-700 hover:text-brand-800 rounded-full transition-colors"
                    title="Sao chép liên kết"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {copied && (
                    <span className="text-green-600 text-[11px]">
                      Đã sao chép!
                    </span>
                  )}
                </div>
              </div>

              {/* ── Comments ─────────────────────────────────────────── */}
              <div className="pt-10 border-t border-slate-200">
                <h3 className="text-xl font-extrabold text-brand-900 mb-6 flex items-center gap-2">
                  💬 Bình Luận Tương Tác
                </h3>

                {/* Form */}
                <form
                  onSubmit={handleComment}
                  className="space-y-3 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-200"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      placeholder="Tên của bạn *"
                      required
                      className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-brand-600 focus:outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Email (bảo mật)"
                      className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-brand-600 focus:outline-none"
                    />
                  </div>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    placeholder="Chia sẻ suy nghĩ hoặc thắc mắc của bạn về bài viết..."
                    required
                    className="w-full p-3.5 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-brand-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={commentMutation.isPending}
                    className="bg-brand-800 hover:bg-brand-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
                  >
                    Gửi Bình Luận
                  </button>
                  {commentError && (
                    <p className="text-xs font-medium text-red-600">
                      {commentError}
                    </p>
                  )}
                </form>

                {/* Comment list */}
                <div className="space-y-4">
                  {engagement.comments.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white p-4 rounded-2xl border border-slate-100 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-900">
                          {c.name}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {formatDate(c.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Sidebar ──────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6">
            {/* CTA widget */}
            <div className="bg-gradient-to-br from-brand-900 to-accent-magenta text-white p-6 rounded-3xl shadow-xl space-y-4 border border-white/20">
              <span className="bg-amber-400 text-brand-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                Đặc Quyền Độc Bản
              </span>
              <h3 className="text-xl font-black text-white">
                Tập Thử 30 Phút Miễn Phí Tại Curves
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                Đăng ký ngay hôm nay để nhận 01 buổi đo InBody chi tiết và tư
                vấn chế độ ăn chuẩn cho phái nữ.
              </p>
              <button
                onClick={() => open("Article Sidebar Widget")}
                className="w-full bg-amber-400 hover:bg-amber-300 text-brand-900 font-extrabold py-3 rounded-xl shadow-lg transition-transform hover:scale-105 text-xs"
              >
                ĐẶT LỊCH NGAY →
              </button>
            </div>

            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
                <h4 className="font-extrabold text-brand-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                  ✨ Bài Viết Nổi Bật
                </h4>
                <div className="space-y-4">
                  {relatedPosts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/blog/${p.slug}`}
                      className="flex gap-3 group"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-brand-100">
                        {p.featuredImage?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.featuredImage.url}
                            alt={p.featuredImage.altText ?? p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            📝
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-900 leading-tight line-clamp-2 group-hover:text-brand-700 transition-colors">
                          {p.title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {formatDate(p.publishedAt)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
