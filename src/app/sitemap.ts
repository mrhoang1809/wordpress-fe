import type { MetadataRoute } from "next";
import { publicApi } from "@/lib/api-client";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://curvesvietnam.com.vn";

export const revalidate = 3600; // 1 hour ISR

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // ── Static pages ─────────────────────────────────────────────────────────────
  entries.push(
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/stories`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  );

  // ── Dynamic blog posts ────────────────────────────────────────────────────────
  try {
    let page = 1;
    let hasMore = true;
    const pageSize = 50; // Fetch in batches to avoid timeout

    while (hasMore) {
      const res = await publicApi.listPosts({
        page,
        pageSize,
      });

      if (!res.data || res.data.length === 0) {
        hasMore = false;
        break;
      }

      res.data.forEach((post) => {
        entries.push({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: post.publishedAt
            ? new Date(post.publishedAt)
            : new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      });

      // Check if there are more pages
      if (res.meta.page >= res.meta.totalPages) {
        hasMore = false;
      } else {
        page++;
      }
    }
  } catch (error) {
    console.error("Failed to fetch posts for sitemap:", error);
    // Continue with other entries even if posts fail
  }

  // ── Dynamic CMS pages ([...slug]) ─────────────────────────────────────────────
  try {
    let page = 1;
    let hasMore = true;
    const pageSize = 50;

    while (hasMore) {
      const res = await publicApi.listPages({
        page,
        pageSize,
      });

      if (!res.data || res.data.length === 0) {
        hasMore = false;
        break;
      }

      res.data.forEach((page) => {
        entries.push({
          url: `${baseUrl}/${page.slug}`,
          lastModified: page.publishedAt
            ? new Date(page.publishedAt)
            : new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      });

      // Check if there are more pages
      if (res.meta.page >= res.meta.totalPages) {
        hasMore = false;
      } else {
        page++;
      }
    }
  } catch (error) {
    console.error("Failed to fetch CMS pages for sitemap:", error);
    // Continue with other entries even if CMS pages fail
  }

  return entries;
}
