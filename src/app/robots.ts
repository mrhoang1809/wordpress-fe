import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://curvesvietnam.com.vn';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog/', '/stories/', '/chinh-sach-bao-mat/', '/dieu-khoan-dich-vu/'],
        disallow: ['/admin/', '/api/', '/admin-api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
