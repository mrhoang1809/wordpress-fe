/**
 * Structured Data (JSON-LD) generators for SEO
 */

export interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
  contactPoint: {
    "@type": "ContactPoint";
    contactType: string;
    telephone: string;
  };
}

export interface ArticleSchema {
  "@context": "https://schema.org";
  "@type": "BlogPosting";
  headline: string;
  description: string;
  image: string | string[];
  datePublished: string;
  dateModified?: string;
  author: {
    "@type": "Person";
    name: string;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    logo: {
      "@type": "ImageObject";
      url: string;
    };
  };
}

export interface BreadcrumbSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

export function generateOrganizationSchema(
  siteUrl: string,
): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Curves Vietnam",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      "Hệ thống phòng tập 30 phút dành riêng cho phụ nữ. Bài tập 3 trong 1, không đàn ông, không gương soi.",
    sameAs: [
      "https://www.facebook.com/curveslangha",
      "https://www.facebook.com/cn.ha.ong.2025",
      "https://www.facebook.com/gym.tran.duy.hung",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      // TODO: Replace with actual phone from SiteSetting or hardcode customer service number
      // Current placeholder: '+84-24-XXXX-XXXX'
      // To fix: Update via SiteSetting in admin panel or hardcode real number here
      telephone: process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? "+84-24-XXXX-XXXX",
    },
  };
}

export function generateArticleSchema(
  title: string,
  description: string,
  image: string | undefined,
  publishedAt: string | null | undefined,
  author: { firstName?: string; lastName?: string } | undefined | null,
  siteUrl: string,
): ArticleSchema {
  const authorName =
    author && author.firstName && author.lastName
      ? `${author.firstName} ${author.lastName}`
      : "Chuyên Gia Curves Vietnam";

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image: image ? [image] : [`${siteUrl}/logo.png`],
    datePublished: publishedAt
      ? new Date(publishedAt).toISOString()
      : new Date().toISOString(),
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Curves Vietnam",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
  };
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
): BreadcrumbSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
