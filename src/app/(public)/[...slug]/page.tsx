import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publicApi } from "@/lib/api-client";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const page = await fetchPage(slugPath);

  if (!page) return { title: "Page not found" };

  const settings = await fetchSettings();
  const seoTitle = page.seo.title ?? settings?.defaultSeoTitle ?? page.title;
  const seoDescription =
    page.seo.description ?? settings?.defaultSeoDescription ?? "";
  const seoImage = page.seo.image ?? settings?.defaultSeoImage;

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: seoImage ? [seoImage] : [],
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

  return (
    <main className="min-h-screen">
      <article>
        <BlockRenderer blocks={page.blocks} />
      </article>
    </main>
  );
}
