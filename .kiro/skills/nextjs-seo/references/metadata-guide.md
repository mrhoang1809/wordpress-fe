# Next.js metadata implementation guide

## First identify the router and version

Check the installed `next` version in `package.json` and determine whether routes live under `app/` / `src/app/` or `pages/` / `src/pages/`. Do not copy examples for a different major version without checking compatibility.

## App Router

Use the Metadata API in Server Components:

```ts
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page title',
  description: 'A clear, unique description of this page.',
}
```

For data-driven pages:

```ts
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const { slug } = await params
  const item = await getItemBySlug(slug)

  if (!item) {
    return { title: 'Not found' }
  }

  return {
    title: item.seoTitle || item.title,
    description: item.seoDescription || item.summary,
    alternates: {
      canonical: `/articles/${item.slug}`,
    },
    openGraph: {
      title: item.seoTitle || item.title,
      description: item.seoDescription || item.summary,
      images: item.ogImage ? [item.ogImage] : undefined,
    },
  }
}
```

Treat this as a pattern, not a drop-in snippet: adapt `params` typing to the installed Next.js version and the project's actual data model.

Set a site-wide title template and metadata base in the root layout where appropriate:

```ts
import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl || 'http://localhost:3000'),
  title: {
    default: 'Brand name',
    template: '%s | Brand name',
  },
  description: 'A concise description of the website.',
}
```

Do not use localhost as the production canonical origin. Validate deployment environment configuration and ensure production uses the correct HTTPS domain.

Metadata exports belong in Server Components. If a page currently has `'use client'`, keep the interactive UI in a child Client Component and move metadata to a Server Component page/layout where feasible. Avoid unnecessary client-to-server architectural rewrites.

## Metadata quality

- Titles: unique, descriptive, concise, and aligned with visible page content.
- Descriptions: unique and useful; avoid keyword lists and boilerplate repeated across every route.
- Canonical: absolute URL resolved against `metadataBase`; point to the preferred URL.
- Robots: set per route only when there is a clear indexing requirement.
- Open Graph: use representative, accessible images with correct absolute URLs.
- Twitter: use suitable card metadata when required by the project's social-sharing needs.
- Locale: configure only the actual supported locale(s); do not claim languages the page does not provide.

## File conventions

Check the installed version's documentation for supported conventions. Common App Router files include:
- `favicon.ico`, `icon.png`, `apple-icon.png`
- `opengraph-image.png` or `opengraph-image.tsx`
- `twitter-image.png` or `twitter-image.tsx`
- `robots.ts`
- `sitemap.ts`

Prefer native file conventions over custom head manipulation when suitable.

## Pages Router

Use the existing Pages Router conventions and installed Next.js version. Do not add App Router metadata exports to `pages/` files. Keep shared `<Head>` metadata centralized only where that matches the existing architecture, and override page-specific metadata deliberately.
