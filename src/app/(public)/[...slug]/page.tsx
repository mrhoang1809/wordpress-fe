import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publicApi } from "@/lib/api-client";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { generateBreadcrumbSchema } from "@/lib/structured-data";
import type { PublicPage, SiteSetting } from "@/types";

async function fetchPage(slug: string): Promise<PublicPage | null> {
  try {
    return await publicApi.getPage(slug);
  } catch {
    return null;
  }
}

async function fetchSettings(): Promise<SiteSetting | null> {
  try {
    return await publicApi.getSettings();
  } catch {
    return null;
  }
}

interface Props {
  params: Promise<{ slug: string[] }>;
}

/**
 * Pre-render common/policy pages at build time for better performance
 * Policy pages: chinh-sach-bao-mat, dieu-khoan-dich-vu
 * Other pages will be generated on-demand with ISR (300s revalidate)
 *
 * NOTE: generateStaticParams disabled in development to avoid build timeouts
 * when backend is unavailable. Enable on production deployment with working API.
 */
export async function generateStaticParams() {
  // Disabled for dev builds (backend not always available)
  // Vercel deployment will regenerate via ISR when pages are first accessed
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const page = await fetchPage(slugPath);

  if (!page) return { title: "Trang không tồn tại" };

  const settings = await fetchSettings();
  const seoTitle = page.seo.title ?? settings?.defaultSeoTitle ?? page.title;
  const seoDescription =
    page.seo.description ?? settings?.defaultSeoDescription ?? "";
  const seoImage = page.seo.image ?? settings?.defaultSeoImage;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: `/${slugPath}`,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: seoImage ? [seoImage] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: seoImage ? [seoImage] : [],
      creator: "@curvesvietnam",
    },
    robots: { index: true, follow: true },
  };
}

export const revalidate = 300; // 5 minutes ISR

export default async function PublicPageRoute({ params }: Props) {
  const { slug } = await params;
  const slugPath = slug.join("/");

  // Reserved routes — never try to resolve these as CMS pages
  const reserved = ["admin", "api", "login", "register", "blog"];
  if (reserved.includes(slugPath.split("/")[0])) {
    notFound();
  }

  const page = await fetchPage(slugPath);
  if (!page) notFound();

  // Generate breadcrumb schema from URL path
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://curvesvietnam.com.vn";
  const breadcrumbItems = [
    { name: "Trang chủ", url: siteUrl },
    ...slug.map((segment, index) => ({
      name: segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      url: `${siteUrl}/${slug.slice(0, index + 1).join("/")}`,
    })),
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <main className="min-h-screen">
        <article>
          <BlockRenderer blocks={page.blocks} />
        </article>
      </main>
    </>
  );
}
