import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publicApi } from "@/lib/api-client";
import { BlogDetails } from "@/components/blog/Details";
import { generateArticleSchema } from "@/lib/structured-data";
import type { PublicPost, PublicPostCard } from "@/types";
import { getDemoStoryPost } from "@/lib/demo-content";

export const revalidate = 120;

interface Props {
  params: Promise<{ slug: string }>;
}

async function fetchPost(slug: string): Promise<PublicPost | null> {
  try {
    return await publicApi.getPublicPost(slug);
  } catch {
    return getDemoStoryPost(slug) ?? null;
  }
}

async function fetchRelated(categorySlug?: string): Promise<PublicPostCard[]> {
  try {
    const res = await publicApi.listPosts({
      pageSize: 4,
      categorySlug: categorySlug || undefined,
    });
    return res.data;
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) return { title: "Bài viết không tồn tại" };

  const title = post.seo.title ?? post.title;
  const description = post.seo.description ?? post.excerpt ?? "";
  const image = post.seo.image ?? post.featuredImage?.url;

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: image ? [image] : [],
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) notFound();

  // Fetch related posts from the first category, excluding current post
  const firstCat = post.categories[0]?.slug;
  const allRelated = await fetchRelated(firstCat);
  const related = allRelated.filter((p) => p.slug !== post.slug).slice(0, 3);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://curvesvietnam.com.vn";
  const articleSchema = generateArticleSchema(
    post.seo.title ?? post.title,
    post.seo.description ?? post.excerpt ?? "",
    post.seo.image ?? post.featuredImage?.url,
    post.publishedAt,
    post.author,
    siteUrl,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      <BlogDetails post={post} relatedPosts={related} />
    </>
  );
}
