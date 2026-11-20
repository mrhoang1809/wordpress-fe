# Structured data (JSON-LD) guide

## General rules

- Use Schema.org types that accurately describe the visible page and real entity.
- JSON-LD must agree with visible content and metadata.
- Never fabricate ratings, review counts, prices, availability, author credentials, dates, addresses, or organization details.
- Do not add every schema type to every page.
- Avoid duplicate/conflicting JSON-LD emitted by multiple components or plugins.
- Escape/serialize data safely. Do not concatenate untrusted strings into raw script markup.
- Validate the output with Google's Rich Results Test and Schema.org Validator; eligibility does not guarantee a rich result.

## Candidate types

Choose only when applicable:
- `Organization` or a more specific verified organization type for the business identity.
- `WebSite` for the website identity; add a search action only if the site genuinely supports it.
- `BreadcrumbList` when matching breadcrumbs are visible.
- `Article` / `BlogPosting` for editorial content with real author and publication information.
- `Product` only for actual product pages with accurate product attributes and compliant offer data.
- `LocalBusiness` or a suitable subtype only when real local business information is publicly shown and verified.
- `Event`, `Course`, `JobPosting`, or other specialized types only when the page genuinely represents that entity and meets the type's requirements.

## Implementation

Prefer a reusable, typed helper/component only if it fits existing project patterns. Use `JSON.stringify` for serialization and guard against unsafe script injection patterns. Keep schema generation server-side when possible.

Do not mark hidden or misleading content as structured data. Do not add `AggregateRating` or `Review` unless the reviews are genuine, visible, and meet current search engine policies.
