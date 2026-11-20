# Technical SEO guide

## Crawlability and indexability

Distinguish:
- Crawlability: whether bots can fetch a URL and its required resources.
- Indexability: whether a fetched page is eligible to appear in search results.
- Ranking: search engine evaluation; never promise a ranking outcome.

Review status codes, redirects, canonical tags, robots directives, internal links, and rendered HTML. Important content should not depend solely on inaccessible client-side interactions.

## Canonical URLs

- Select one preferred HTTPS host and URL format.
- Avoid conflicting canonical signals.
- Canonicalize tracking/query variants only when they represent duplicate content.
- Do not canonicalize unrelated pages to the homepage.
- Preserve intentional pagination, filters, and locale behavior; decide indexing policy based on actual content strategy.

## Sitemap

For App Router, `app/sitemap.ts` can return `MetadataRoute.Sitemap`. Include only canonical public URLs intended for indexing. For dynamic entries, query the authoritative data source and exclude drafts, deleted records, private content, and `noindex` pages. Use meaningful `lastModified` values from actual content updates; do not set every URL to the current time merely to appear fresh.

For very large sites, assess sitemap splitting and sitemap indexes according to the installed Next.js version and project architecture.

## Robots

For App Router, `app/robots.ts` can return `MetadataRoute.Robots`. Rules should reflect the site's real crawl policy. Do not assume `Disallow` removes a URL from search results. Use `noindex` when a page must not be indexed and bots are allowed to fetch it to see the directive.

Do not block CSS, JS, images, or other assets required to render important pages unless there is a specific reason.

## Redirects and URL changes

- Inventory existing routes and inbound-link-sensitive URLs.
- Preserve slugs wherever possible.
- If a URL must change, use a permanent redirect (typically 301/308 as appropriate to the platform) from old to new.
- Avoid redirect chains and loops.
- Update internal links, canonical tags, and sitemap entries to the destination URL.

## Performance and rendering

Evaluate real user experience, not just a synthetic score. Consider LCP, INP, and CLS; optimize image dimensions/formats, font loading, layout stability, server response, and unnecessary JavaScript. Use `next/image` where appropriate and preserve meaningful alt text. Do not lazy-load the likely LCP hero image blindly; inspect the current Next.js version's image priority/loading API.

## International and local SEO

For multi-language routes, inspect the actual locale routing and content translations before adding `hreflang`. Each alternate must resolve to a valid equivalent page and use consistent reciprocal references. For local business schema, use verified business details only.
