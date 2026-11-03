# GRAPH REPORT — viber-wordpress/fe

> **Built:** 2025-07-14 | **Nodes:** 76 | **Edges:** 103 | **Communities:** 9

---

## 1. Executive Summary

This workspace is the **Next.js 15 (App Router) frontend** for a Vietnamese fitness brand CMS — "Curves Vietnam". It serves two audiences simultaneously:

1. **Public website** — A brand homepage with animated sections, a blog, CMS-driven pages, gym location finder, and a live promotion countdown banner.
2. **Admin dashboard** — A full CMS admin panel with page builder, post editor, media library, messaging campaigns, promotions, settings, and more.

### Tech Stack

| Concern      | Choice                                         |
| ------------ | ---------------------------------------------- |
| Framework    | Next.js 15.3, App Router                       |
| Language     | TypeScript 5                                   |
| Styling      | Tailwind CSS 4 with custom brand palette       |
| Server state | TanStack Query v5                              |
| Client state | Zustand v5                                     |
| API          | Custom fetch wrapper (`src/lib/api-client.ts`) |
| UI icons     | Lucide React                                   |
| Fonts        | Inter (Google Fonts)                           |

### Key Numbers

- **98 nodes** across files, components, hooks, and code symbols
- **152 edges** (imports, uses, fetches, calls)
- **9 communities** by functional domain
- **2 provider trees**: `PublicProviders` (root layout) + `AdminProviders` (admin subtree)
- **15 home section components**, **3 blog components**, **6 block renderers**
- **1 central API client** serving all 12 backend modules

---

## 2. Architecture Overview

```
Browser Request
    │
    ├─► / (homepage)
    │       RootLayout (layout.tsx)
    │         └── PublicProviders (TanStack Query)
    │               └── TrialRegistrationModal (context)
    │                     └── HomePage (page.tsx)
    │                           ├── Header           ← useTrialModal
    │                           ├── FloatingPromotionButton  ← useAuthStore
    │                           ├── HeroSection
    │                           ├── WorkoutSection
    │                           ├── AdvantagesSection
    │                           ├── BmiCalculatorSection
    │                           ├── LocationsSection  ← publicApi.listLocations()
    │                           ├── SuccessStoriesSection ← publicApi.listPosts()
    │                           ├── PromotionCountdownSection ← promotionsApi.getActive()
    │                           ├── FaqSection
    │                           └── Footer
    │
    ├─► /blog  (SSR + ISR)
    │       (public)/layout.tsx → Header + Footer + FloatingPromotionButton
    │         └── BlogPage (server) → publicApi.listPosts + getCategoryTree
    │               └── Blog (client) ← useIntersectionObserver (infinite scroll)
    │                     └── PostCard (link)
    │
    ├─► /blog/[slug]  (ISR 120s)
    │       BlogDetailPage (server) → publicApi.getPublicPost
    │         └── BlogDetails (client)
    │               ├── BlockRenderer → BLOCK_REGISTRY → HeroBlock/RichTextBlock/…
    │               └── publicApi.getPostEngagement / likePost / recordPostView
    │
    ├─► /[...slug]  (ISR 300s)
    │       PublicPageRoute (server) → publicApi.getPage
    │         └── BlockRenderer → BLOCK_REGISTRY
    │
    └─► /admin/*
            AdminLayout (thin pass-through)
              ├─► /admin/login  (auth route group — no providers)
              │     └── LoginPage
              │
              └─► /admin/**  (dashboard route group)
                    AdminDashboardLayout
                      ├── AdminProviders
                      │     ├── TanStack QueryClient
                      │     └── AuthBootstrap ─► POST /auth/refresh → GET /auth/me
                      │                         → useAuthStore.setAuth()
                      └── AdminLayoutShell
                            ├── useAuthStore (reads isReady, user)
                            ├── AdminSidebar ← useAuth ← useAuthStore
                            └── <page content>
```

### Data Flow — API Client

All API calls go through `src/lib/api-client.ts`:

```
Component → request() → fetch(BASE_URL + path)
                │
                ├── auth=true → getStoreToken()
                │                    │
                │                    ├── token present → attach Bearer header
                │                    └── token missing → refreshOnce() → retry
                │
                └── 401 received → refreshOnce() → retry once
                                        │
                                        └── refresh fails → setStoreToken(null) → clearAuth()
```

---

## 3. Community Breakdown

### 3.1 `auth` — Authentication (8 nodes, cohesion: 0.88)

**Purpose:** Session lifecycle for the admin area. Zustand-backed, no localStorage — token lives in memory only.

| File                                  | Role                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| `src/store/auth.store.ts`             | Single source of truth: `accessToken`, `user`, `isBootstrapping`, `isReady`    |
| `src/features/auth/AuthBootstrap.tsx` | Mounts once in admin; calls `/auth/refresh` then `/auth/me` to restore session |
| `src/features/auth/useAuth.ts`        | Hook: login, logout actions + state from store                                 |
| `src/features/auth/AuthProvider.tsx`  | Compat shim re-exporting `useAuth`                                             |
| `src/app/admin/providers.tsx`         | `AdminProviders`: TanStack Query + AuthBootstrap                               |
| `src/app/admin/(auth)/layout.tsx`     | Login route group (no sidebar)                                                 |
| `src/app/admin/(auth)/login/page.tsx` | Login form page                                                                |
| `src/middleware.ts`                   | Passes all `/admin/*` through to `AuthBootstrap`                               |

**Key exports:** `useAuthStore`, `getStoreToken`, `setStoreToken`, `useAuth`, `AuthBootstrap`, `AdminProviders`

**Dependencies (fan-in):** `api-client.ts` (reads store token), `AdminLayoutShell` (reads isReady/user), `FloatingPromotionButton` (reads user), `AdminSidebar` (reads user via useAuth)

---

### 3.2 `store` — State Management (1 node, cohesion: 1.0)

**Purpose:** Single Zustand store managing auth state.

`src/store/auth.store.ts` exports:

- `useAuthStore` — React hook
- `getStoreToken()` — synchronous getter for use outside React (in api-client.ts)
- `setStoreToken(token)` — synchronous setter

The store is intentionally minimal — no persistence, no devtools by default.

---

### 3.3 `api-client` — API Client Layer (5 nodes, cohesion: 0.82)

**Purpose:** Central HTTP layer. Every backend call goes through here.

**`src/lib/api-client.ts`** is the god node of this community:

- Defines `ApiError` class
- Implements JWT token injection (`getStoreToken`)
- Implements silent refresh (singleton Promise to prevent concurrent refreshes)
- Exports typed API namespaces:

| Namespace        | Methods                                                                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authApi`        | login, logout, me                                                                                                                                                |
| `pagesApi`       | list, get, create, update, delete, publish, unpublish, duplicate, getBlocks, syncBlocks                                                                          |
| `postsApi`       | list, get, create, update, delete, publish, unpublish                                                                                                            |
| `publicApi`      | listLocations, getPage, listPosts, getPublicPost, getPostEngagement, recordPostView, likePost, createPostComment, getPost, getCategoryTree, getMenu, getSettings |
| `mediaApi`       | list, upload, delete                                                                                                                                             |
| `categoriesApi`  | list, create, update, delete                                                                                                                                     |
| `menusApi`       | list, get, create, update, syncItems                                                                                                                             |
| `settingsApi`    | get, update                                                                                                                                                      |
| `subscribersApi` | list, get, create, import, update, delete, getTags                                                                                                               |
| `campaignsApi`   | list, get, getStats, create, update, send, cancel, delete                                                                                                        |
| `templatesApi`   | list, get, create, update, delete                                                                                                                                |
| `locationsApi`   | list, get, create, update, delete                                                                                                                                |
| `promotionsApi`  | getActive, list, get, create, update, activate, deactivate, delete                                                                                               |

**`src/lib/utils.ts`** exports: `cn` (Tailwind merge), `slugify`, `formatDate`, `spacingClass`

---

### 3.4 `types` — Type Definitions (3 nodes, cohesion: 0.70)

**Purpose:** Central TypeScript contract types mirroring the backend Prisma models.

**`src/types/index.ts`** — All domain types:

- Block types: `BlockType`, `PageBlock`, `HeroBlockData`, `BannerBlockData`, `RichTextBlockData`, `ImageBlockData`, `CtaBlockData`, `FaqBlockData`, `PageBlockData`
- Entities: `Page`, `PublicPage`, `Post`, `PublicPost`, `PublicPostCard`, `Category`, `MenuItem`, `Menu`, `UserProfile`, `SiteSetting`, `MediaItem`
- Engagement: `PublicPostEngagement`, `PublicPostComment`
- Messaging: `Subscriber`, `MessageCampaign`, `MessageRecipient`, `MessageTemplate`, `CampaignStats`
- Locations: `Location`
- Promotions: `PromotionBanner`
- API shapes: `PaginatedResponse<T>`, `PaginationMeta`, `ApiError`

---

### 3.5 `public-pages` — Public Pages (10 nodes, cohesion: 0.72)

**Purpose:** All non-home public-facing routes.

| File                                      | Route                               | Type                            |
| ----------------------------------------- | ----------------------------------- | ------------------------------- |
| `src/app/layout.tsx`                      | `*`                                 | Root layout (server)            |
| `src/app/(public)/layout.tsx`             | `/blog/*`, `/stories`, `/[...slug]` | Public group layout (server)    |
| `src/app/(public)/[...slug]/page.tsx`     | `/[...slug]`                        | ISR CMS page (server, 300s)     |
| `src/app/(public)/stories/page.tsx`       | `/stories`                          | Stories listing (server)        |
| `src/components/home/PublicProviders.tsx` | —                                   | TanStack QueryClient for public |
| `src/components/layout/PublicHeader.tsx`  | —                                   | Alternative header              |
| `src/lib/demo-content.ts`                 | —                                   | Fallback static data            |
| `src/hooks/useIntersectionObserver.ts`    | —                                   | Infinite scroll hook            |

---

### 3.6 `components-home` — Home Components (16 nodes, cohesion: 0.85)

**Purpose:** All homepage UI components. These are the brand-facing sections of the Curves Vietnam website.

| Component                   | Description                                               |
| --------------------------- | --------------------------------------------------------- |
| `Header`                    | Sticky navbar with scroll glass effect, mobile drawer     |
| `AnnouncementBar`           | Promotion-aware top bar (fetches active banner)           |
| `FloatingPromotionButton`   | Fixed bottom-right CTA, hidden when logged in             |
| `HeroSection`               | Hero with brand imagery and CTA                           |
| `WorkoutSection`            | 30-minute workout method showcase                         |
| `AdvantagesSection`         | Equipment advantages                                      |
| `BmiCalculatorSection`      | Interactive BMI/calorie calculator                        |
| `LocationsSection`          | Location grid with city filter (fetches API)              |
| `SuccessStoriesSection`     | Story cards (fetches posts with category filter)          |
| `PromotionCountdownSection` | Live countdown timer (fetches active promotion)           |
| `FaqSection`                | FAQ accordion                                             |
| `Footer`                    | Site footer                                               |
| `TrialRegistrationModal`    | Global trial registration modal + `useTrialModal` context |
| `HomeProviders`             | QueryClient wrapper for home                              |
| `PublicProviders`           | Root-level QueryClient                                    |

**API calls from this community:**

- `publicApi.listLocations()` — LocationsSection
- `publicApi.listPosts({ categorySlug: 'truyen-cam-hung' })` — SuccessStoriesSection
- `promotionsApi.getActive()` — PromotionCountdownSection + AnnouncementBar

---

### 3.7 `components-blog` — Blog Components (5 nodes, cohesion: 0.80)

**Purpose:** Blog listing, detail view, and stories.

| Component     | Key Features                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------- |
| `Blog`        | Category tabs, search form, infinite scroll (IntersectionObserver), PostCard                  |
| `BlogDetails` | TOC extraction from RICH_TEXT blocks, engagement bar (views/likes), comment form, sidebar CTA |
| `StoriesList` | Success stories listing                                                                       |

**Blog flow:**

1. `BlogPage` (server) → `publicApi.listPosts` + `getCategoryTree` → passes as props
2. `Blog` (client) → handles category/search navigation + infinite scroll
3. On scroll bottom: direct `fetch(BASE_URL/public/posts)` for next page

**BlogDetails flow:**

1. `BlogDetailPage` (server) → `publicApi.getPublicPost` + `listPosts` (related)
2. `BlogDetails` (client) → `useQuery(getPostEngagement)` + mutations for view/like/comment
3. Renders blocks via `BlockRenderer → BLOCK_REGISTRY`

---

### 3.8 `admin-pages` — Admin Dashboard (22 nodes, cohesion: 0.78)

**Purpose:** Full CMS admin panel. All routes under `/admin/(dashboard)/*` are protected.

**Layout tree:**

```
AdminDashboardLayout
  ├── AdminProviders (TanStack Query + AuthBootstrap)
  └── AdminLayoutShell
        ├── AdminSidebar (navigation)
        └── <page>
```

**Admin pages/sections:**
| Route | Description |
|---|---|
| `/admin` | Dashboard overview |
| `/admin/pages` | Page list + PageEditor (block builder) |
| `/admin/posts` | Post list + post editor |
| `/admin/stories` | Success stories (posts with specific category) |
| `/admin/categories` | Category tree management |
| `/admin/locations` | Gym branch CRUD |
| `/admin/menus` | Menu structure editor |
| `/admin/media` | Media library with upload |
| `/admin/promotions` | Promotion banner CRUD + activate |
| `/admin/messaging/zalo` | Zalo messaging campaigns |
| `/admin/messaging/facebook` | Facebook messaging campaigns |
| `/admin/settings` | Site settings |

**Page Builder (features/page-builder/):**

- `BLOCK_REGISTRY` — static map of block type → renderer + form + defaults
- `PageEditor` — drag/reorder blocks, BlockLibrary, BlockSettingsPanel
- `usePages` — TanStack Query hook for admin page CRUD

**Block types registered:** HERO, BANNER, RICH_TEXT, IMAGE, CTA, FAQ

---

## 4. Critical Paths

### 4.1 Admin Auth Flow (first load)

```
Browser → /admin/dashboard
  → AdminDashboardLayout
      → AdminProviders
          → AuthBootstrap.useEffect()
              → POST /auth/refresh (HttpOnly cookie)
                  → success → GET /auth/me
                      → useAuthStore.setAuth(token, user)
                          → AdminLayoutShell re-renders (isBootstrapping=false, user≠null)
                              → AdminSidebar rendered
                  → failure → useAuthStore.clearAuth()
                      → AdminLayoutShell.useEffect → router.replace('/admin/login')
```

### 4.2 Public API Request with Token Refresh

```
Component → api-client.request('/some-admin-endpoint', { auth: true })
    → getStoreToken() → null (first load after page refresh)
        → refreshOnce() → POST /auth/refresh
            → success → setStoreToken(newToken)
                → retry original request with Bearer header
            → failure → setStoreToken(null) → clearAuth()
    → token present → attach Authorization: Bearer <token>
    → 401 on response → refreshOnce() → retry once
```

### 4.3 Public Homepage Data Flow

```
Browser → /
  → RootLayout → PublicProviders (QueryClient)
      → TrialRegistrationModal (modal context provider)
          → HomePage (static server component)
              → [LocationsSection client mount]
                  → useQuery(['public-locations']) → publicApi.listLocations()
                  → GET /api/v1/public/locations
              → [SuccessStoriesSection client mount]
                  → useQuery(['public-stories']) → publicApi.listPosts({ categorySlug: 'truyen-cam-hung' })
              → [PromotionCountdownSection client mount]
                  → useQuery(['active-promotion']) → promotionsApi.getActive()
                  → GET /api/v1/public/promotions/active
              → [AnnouncementBar client mount]
                  → useQuery(['active-promotion-announcement']) → promotionsApi.getActive()
```

### 4.4 Blog Detail Page — Engagement

```
/blog/[slug]
  → BlogDetailPage (server) → publicApi.getPublicPost(slug)
      → BlogDetails (client mount)
          → publicApi.recordPostView(slug)  [on mount, once]
          → useQuery(['post-engagement', slug]) → publicApi.getPostEngagement(slug)
          → user clicks Like → useMutation → publicApi.likePost(slug)
          → user submits comment → useMutation → publicApi.createPostComment(slug, input)
              → optimistic update via queryClient.setQueryData
```

### 4.5 Page Builder Save Flow

```
Admin edits page in PageEditor
  → BlockSettingsPanel updates block data in local state
  → User clicks Save
      → pagesApi.syncBlocks(pageId, version, blocks) → PUT /pages/:id/blocks
          → version conflict → 409 → user prompted to refresh
          → success → queryClient.invalidateQueries(['page', pageId])
```

---

## 5. God Nodes

Nodes with the highest fan-in (depended upon by many others):

| Node                      | Type      | Fan-in | Fan-out | Why it's a hub                                                                                                   |
| ------------------------- | --------- | ------ | ------- | ---------------------------------------------------------------------------------------------------------------- |
| `src/lib/api-client.ts`   | FILE      | 15+    | 3       | Every component that fetches data imports from here                                                              |
| `src/store/auth.store.ts` | FILE      | 7      | 1       | Auth state read by api-client, shell, sidebar, FloatingBtn, AuthBootstrap, useAuth                               |
| `src/types/index.ts`      | FILE      | 12+    | 0       | All domain types used by components, api-client, hooks                                                           |
| `TrialRegistrationModal`  | COMPONENT | 6      | 1       | Used by Header, AnnouncementBar, LocationsSection, SuccessStoriesSection, PromotionCountdownSection, BlogDetails |
| `BLOCK_REGISTRY`          | CODE      | 3      | 6       | Central registry for all 6 block types; used by BlockRenderer, BlockLibrary, BlockSettingsPanel                  |
| `src/lib/utils.ts`        | FILE      | 5      | 0       | `cn()` used everywhere for Tailwind class merging                                                                |

---

## 6. Dependency Risks

### 6.1 Circular Dependencies

No circular imports detected. The dependency direction is clean:

- `types/index.ts` ← `api-client.ts` ← `store/auth.store.ts` ← components

### 6.2 Single Points of Failure

- **`api-client.ts`** — if this module breaks, the entire app's data layer fails. It has no fallback mechanism except demo-content for specific components.
- **`store/auth.store.ts`** — all auth flows depend on this. A Zustand version breaking change would affect the whole admin area.

### 6.3 Orphaned / Risk Files

- `src/components/layout/PublicHeader.tsx` — exists but doesn't appear to be used; `Header.tsx` in `components/home/` is the actual header.
- `src/features/auth/AuthProvider.tsx` — compatibility shim only. Could be removed once all callers are updated to import from `useAuth.ts` directly.
- `src/lib/auth-cookies.ts` — only exports `REFRESH_TOKEN_COOKIE` used in middleware.ts. The middleware itself is currently a no-op.

### 6.4 SSR / Client Boundary Risk

- `Blog.tsx`, `BlogDetails.tsx`, and all home section components are `"use client"`. They import from `api-client.ts` which uses `process.env.NEXT_PUBLIC_API_URL`. Ensure this is set in `.env.local` for local dev.
- `FloatingPromotionButton` accesses `localStorage` indirectly via Zustand — safe since Zustand initializes lazily, but the `user` check renders null on server (correct behaviour for client component).

### 6.5 Missing Error Boundaries

- `Blog.tsx` uses direct `fetch()` for infinite scroll without an error boundary. Failed loads silently stop pagination.
- `BlockRenderer` returns `null` for unknown block types — this is intentional but could mask data issues in production.

---

## 7. Component Tree

### 7.1 Homepage (`/`)

```
RootLayout
└── PublicProviders (QueryClient)
    └── TrialRegistrationModal
        └── main
            └── HomePage
                ├── Header
                │   └── AnnouncementBar ──── [GET /public/promotions/active]
                ├── FloatingPromotionButton
                ├── HeroSection
                ├── WorkoutSection
                ├── AdvantagesSection
                ├── BmiCalculatorSection
                ├── LocationsSection ──────── [GET /public/locations]
                ├── SuccessStoriesSection ─── [GET /public/posts?categorySlug=truyen-cam-hung]
                ├── PromotionCountdownSection  [GET /public/promotions/active]
                │   └── BannerContent
                │       └── Countdown (live timer)
                ├── FaqSection
                └── Footer
```

### 7.2 Blog (`/blog`)

```
RootLayout
└── PublicProviders
    └── (public)/layout.tsx
        ├── Header
        ├── FloatingPromotionButton
        ├── BlogPage (server) ─── [GET /public/posts], [GET /public/categories]
        │   └── Blog (client)
        │       ├── search form
        │       ├── category tabs
        │       └── [PostCard]... (infinite scroll via IntersectionObserver)
        └── Footer
```

### 7.3 Blog Detail (`/blog/[slug]`)

```
RootLayout
└── PublicProviders
    └── (public)/layout.tsx
        ├── Header
        ├── FloatingPromotionButton
        ├── BlogDetailPage (server) ─── [GET /public/posts/:slug], [GET /public/posts?related]
        │   └── BlogDetails (client)
        │       ├── Article header (hero image, meta)
        │       ├── TOC (extracted from RICH_TEXT blocks)
        │       ├── BlockRenderer
        │       │   └── [HeroBlock | RichTextBlock | ImageBlock | CtaBlock | FaqBlock | BannerBlock]
        │       ├── Engagement bar (views / likes / share)
        │       ├── Comments section
        │       └── Sidebar
        │           ├── CTA widget → TrialRegistrationModal
        │           └── Related posts
        └── Footer
```

### 7.4 CMS Page (`/[...slug]`)

```
(public)/layout.tsx
└── PublicPageRoute (server) ─── [GET /public/pages/:slug]
    └── BlockRenderer
        └── BLOCK_REGISTRY[block.type].publicRenderer
            → HeroBlock | BannerBlock | RichTextBlock | ImageBlock | CtaBlock | FaqBlock
```

### 7.5 Admin Dashboard (`/admin/(dashboard)/*`)

```
AdminDashboardLayout
├── AdminProviders
│   ├── QueryClientProvider
│   └── AuthBootstrap ─── [POST /auth/refresh] → [GET /auth/me]
└── AdminLayoutShell
    ├── AdminSidebar
    │   └── nav links → /admin/pages, /admin/posts, /admin/categories, etc.
    └── <page>
        Examples:
        ├── PageEditor → BlockLibrary + BlockCard[] + BlockSettingsPanel
        ├── ChannelShell → ChannelNav + CampaignsList + SubscribersManager + TemplatesManager
        └── PromotionsPage → promotionsApi.*
```

---

## 8. ISR / Caching Strategy

| Route                     | Strategy                                          | TTL                                    |
| ------------------------- | ------------------------------------------------- | -------------------------------------- |
| `/blog`                   | `export const revalidate = 60`                    | 1 minute                               |
| `/blog/[slug]`            | `export const revalidate = 120`                   | 2 minutes                              |
| `/[...slug]`              | `export const revalidate = 300`                   | 5 minutes                              |
| Homepage (`/`)            | Static by default (no revalidate)                 | Until rebuild or revalidation API call |
| Client queries (TanStack) | `staleTime: 5*60_000` (public) / `30_000` (admin) | —                                      |

---

_Report generated by graphify — token budget: ~12,000 tokens read_
