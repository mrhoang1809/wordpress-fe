import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 500);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function spacingClass(spacing?: string): string {
  const map: Record<string, string> = {
    none: "py-0",
    sm: "py-4",
    md: "py-8",
    lg: "py-16",
    xl: "py-24",
  };
  return map[spacing ?? "md"] ?? "py-8";
}

/**
 * Resolve a media URL that might be a relative path from old uploads.
 * New uploads from BE already return absolute URLs.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("//")
  )
    return url;
  // Relative path — prepend the API base origin
  const base = (
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1"
  ).replace("/api/v1", "");
  return `${base}${url}`;
}
