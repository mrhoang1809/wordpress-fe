# SEO implementation checklist

## Discovery
- [ ] Confirm Next.js version and router.
- [ ] Inspect existing metadata and SEO dependencies.
- [ ] Identify production origin and deployment environments.
- [ ] Inventory public, private, dynamic, and localized routes.

## Metadata and content
- [ ] Unique title and description for each indexable route.
- [ ] Correct title template and metadata inheritance.
- [ ] Canonical points to the preferred public URL.
- [ ] Open Graph/Twitter metadata is relevant and uses valid images.
- [ ] Dynamic metadata uses authoritative page data.
- [ ] Missing content returns the correct not-found response.
- [ ] Semantic HTML, logical headings, useful internal links, and meaningful image alt text.

## Technical
- [ ] robots.txt reflects intended crawl policy.
- [ ] sitemap.xml contains only canonical, public, indexable URLs.
- [ ] Redirects have no loops or unnecessary chains.
- [ ] Private/admin/staging routes are not accidentally indexable.
- [ ] Middleware does not block metadata endpoints.
- [ ] No accidental `noindex` on important pages.

## Structured data
- [ ] Schema matches visible, verified content.
- [ ] No fabricated properties or duplicate conflicting JSON-LD.
- [ ] JSON-LD serialization is safe.
- [ ] External validators have been run where possible.

## Validation and delivery
- [ ] Lint executed (or reported unavailable).
- [ ] Typecheck executed (or reported unavailable).
- [ ] Tests executed where relevant.
- [ ] Production build executed (or reported blocked).
- [ ] Representative rendered HTML/head inspected.
- [ ] Sitemap and robots output inspected.
- [ ] Remaining manual tasks and limitations documented.
