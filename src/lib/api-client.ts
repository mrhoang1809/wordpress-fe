/**
 * API Client
 *
 * All authenticated requests read the access token from the Zustand auth store
 * via getStoreToken(). When a 401 is received the client attempts a silent
 * token refresh (using the HttpOnly refresh cookie set by the backend) and
 * retries the original request once.  If the refresh also fails the store is
 * cleared and the caller receives the 401 error — the auth bootstrap logic in
 * AuthBootstrap.tsx will then redirect to /admin/login.
 */

import { getStoreToken, setStoreToken } from "@/store/auth.store";
import { PaginatedResponse, Post } from "@/types";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

// ─── Error class ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Refresh token (singleton promise to prevent concurrent refreshes) ────────

let refreshing: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  try {
    console.log("[API] Calling /auth/refresh...");
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // sends the HttpOnly refresh cookie
    });

    console.log("[API] /auth/refresh response:", res.status, res.ok);

    if (!res.ok) {
      setStoreToken(null);
      return false;
    }

    const data = (await res.json()) as { accessToken: string };
    setStoreToken(data.accessToken);
    return true;
  } catch {
    setStoreToken(null);
    return false;
  }
}

function refreshOnce(): Promise<boolean> {
  if (!refreshing) {
    refreshing = doRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

// ─── Core request ─────────────────────────────────────────────────────────────

/**
 * options.auth = true  → attach Bearer token, retry once after refresh on 401
 * options.auth = false → public endpoint, no token, no retry
 */
async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Attach access token from Zustand. If it's missing (e.g. page reload),
  // try one silent refresh using the HttpOnly cookie first.
  if (auth) {
    let token = getStoreToken();
    if (!token) {
      const refreshed = await refreshOnce();
      if (refreshed) token = getStoreToken();
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    // ── 401 handling: try refresh once ───────────────────────────────────
    if (response.status === 401 && auth) {
      const refreshed = await refreshOnce();
      if (refreshed) {
        // Retry with the new token from store
        const newToken = getStoreToken();
        const retryHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          ...(fetchOptions.headers as Record<string, string>),
        };
        if (newToken) retryHeaders["Authorization"] = `Bearer ${newToken}`;

        const retry = await fetch(`${BASE_URL}${path}`, {
          ...fetchOptions,
          headers: retryHeaders,
          credentials: "include",
        });

        if (retry.ok) {
          if (retry.status === 204) return undefined as T;
          return retry.json() as Promise<T>;
        }

        // Retry also failed — parse and throw
        let retryError: { message?: string; details?: unknown } = {};
        try {
          retryError = await retry.json();
        } catch {
          /* ignore */
        }
        throw new ApiError(
          retry.status,
          retryError.message ?? `HTTP ${retry.status}`,
          retryError.details,
        );
      }
      // Refresh failed — clear auth (store clearAuth also called inside doRefresh)
    }

    // Parse error body
    let errorData: { message?: string; details?: unknown } = {};
    try {
      errorData = await response.json();
    } catch {
      /* ignore */
    }

    throw new ApiError(
      response.status,
      errorData.message ?? `HTTP ${response.status}`,
      errorData.details,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; user: import("@/types").UserProfile }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
        auth: false,
      },
    ),

  logout: () => request<void>("/auth/logout", { method: "POST" }),

  me: (token?: string) => {
    if (token) {
      // Called during bootstrap with an explicit token — skip store lookup
      return request<import("@/types").UserProfile>("/auth/me", {
        auth: false,
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    return request<import("@/types").UserProfile>("/auth/me");
  },
};

// ─── Pages ────────────────────────────────────────────────────────────────────

export const pagesApi = {
  list: (params?: Record<string, string | number>) =>
    request<import("@/types").PaginatedResponse<import("@/types").Page>>(
      `/pages?${new URLSearchParams(params as Record<string, string>)}`,
    ),

  get: (id: string) => request<import("@/types").Page>(`/pages/${id}`),

  create: (data: Partial<import("@/types").Page>) =>
    request<import("@/types").Page>("/pages", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<import("@/types").Page>) =>
    request<import("@/types").Page>(`/pages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) => request<void>(`/pages/${id}`, { method: "DELETE" }),

  publish: (id: string) =>
    request<import("@/types").Page>(`/pages/${id}/publish`, { method: "POST" }),

  unpublish: (id: string) =>
    request<import("@/types").Page>(`/pages/${id}/unpublish`, {
      method: "POST",
    }),

  duplicate: (id: string) =>
    request<import("@/types").Page>(`/pages/${id}/duplicate`, {
      method: "POST",
    }),

  getBlocks: (id: string) =>
    request<import("@/types").PageBlock[]>(`/pages/${id}/blocks`),

  syncBlocks: (
    id: string,
    version: number,
    blocks: import("@/types").PageBlock[],
  ) =>
    request<import("@/types").Page>(`/pages/${id}/blocks`, {
      method: "PUT",
      body: JSON.stringify({ version, blocks }),
    }),
};

// ─── Posts ────────────────────────────────────────────────────────────────────

export const postsApi = {
  list: (params?: Record<string, string | number>) =>
    request<PaginatedResponse<Post>>(
      `/posts?${new URLSearchParams(params as Record<string, string>)}`,
    ),

  get: (id: string) => request<import("@/types").Post>(`/posts/${id}`),

  create: (data: Partial<import("@/types").Post>) =>
    request<import("@/types").Post>("/posts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<import("@/types").Post>) =>
    request<import("@/types").Post>(`/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) => request<void>(`/posts/${id}`, { method: "DELETE" }),

  publish: (id: string) =>
    request<import("@/types").Post>(`/posts/${id}/publish`, { method: "POST" }),

  unpublish: (id: string) =>
    request<import("@/types").Post>(`/posts/${id}/unpublish`, {
      method: "POST",
    }),

  getBlocks: (id: string) =>
    request<import("@/types").PageBlock[]>(`/posts/${id}/blocks`),

  syncBlocks: (
    id: string,
    version: number,
    blocks: import("@/types").PageBlock[],
  ) =>
    request<import("@/types").Post>(`/posts/${id}/blocks`, {
      method: "PUT",
      body: JSON.stringify({ version, blocks }),
    }),
};

// ─── Public (no auth) ─────────────────────────────────────────────────────────

export const publicApi = {
  listLocations: () =>
    request<import("@/types").Location[]>("/public/locations", { auth: false }),

  getPage: (slug: string) =>
    request<import("@/types").PublicPage>(`/public/pages/${slug}`, {
      auth: false,
    }),

  /** List published posts with optional filters */
  listPosts: (params?: {
    page?: number;
    pageSize?: number;
    categorySlug?: string;
    search?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
    if (params?.categorySlug) qs.set("categorySlug", params.categorySlug);
    if (params?.search) qs.set("search", params.search);
    return request<
      import("@/types").PaginatedResponse<import("@/types").PublicPostCard>
    >(`/public/posts?${qs.toString()}`, { auth: false });
  },

  /** Get a single published post by slug */
  getPublicPost: (slug: string) =>
    request<import("@/types").PublicPost>(`/public/posts/${slug}`, {
      auth: false,
    }),

  getPostEngagement: (slug: string) =>
    request<import("@/types").PublicPostEngagement>(
      `/public/posts/${slug}/engagement`,
      { auth: false },
    ),

  recordPostView: (slug: string) =>
    request<import("@/types").PublicPostEngagement>(
      `/public/posts/${slug}/views`,
      { method: "POST", auth: false },
    ),

  likePost: (slug: string) =>
    request<import("@/types").PublicPostEngagement>(
      `/public/posts/${slug}/likes`,
      { method: "POST", auth: false },
    ),

  createPostComment: (slug: string, input: { name: string; text: string }) =>
    request<import("@/types").PublicPostEngagement>(
      `/public/posts/${slug}/comments`,
      { method: "POST", body: JSON.stringify(input), auth: false },
    ),

  // Legacy — kept for backward compat
  getPost: (slug: string) =>
    request<import("@/types").Post>(`/public/posts/${slug}`, { auth: false }),

  getCategoryTree: () =>
    request<import("@/types").Category[]>("/public/categories", {
      auth: false,
    }),

  getMenu: (location: string) =>
    request<import("@/types").Menu>(`/public/menus/${location}`, {
      auth: false,
    }),

  getSettings: () =>
    request<import("@/types").SiteSetting>("/settings", { auth: false }),
};

// ─── Media ────────────────────────────────────────────────────────────────────

export const mediaApi = {
  list: (params?: Record<string, string | number>) =>
    request<import("@/types").PaginatedResponse<import("@/types").MediaItem>>(
      `/media?${new URLSearchParams(params as Record<string, string>)}`,
    ),

  upload: async (file: File, altText?: string, caption?: string) => {
    const buildForm = () => {
      const form = new FormData();
      form.append("file", file);
      if (altText) form.append("altText", altText);
      if (caption) form.append("caption", caption);
      return form;
    };

    let token = getStoreToken();
    if (!token) {
      const refreshed = await refreshOnce();
      if (refreshed) token = getStoreToken();
    }

    const uploadOnce = (accessToken: string | null) =>
      fetch(`${BASE_URL}/media`, {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body: buildForm(),
        credentials: "include",
      });

    let res = await uploadOnce(token);
    if (res.status === 401) {
      const refreshed = await refreshOnce();
      if (refreshed) res = await uploadOnce(getStoreToken());
    }
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string };
      throw new ApiError(res.status, err.message ?? "Upload failed");
    }
    return res.json() as Promise<import("@/types").MediaItem>;
  },

  delete: (id: string) => request<void>(`/media/${id}`, { method: "DELETE" }),
};

// ─── Categories ───────────────────────────────────────────────────────────────

export const categoriesApi = {
  list: () =>
    request<import("@/types").PaginatedResponse<import("@/types").Category>>(
      "/categories",
    ),
  create: (data: Partial<import("@/types").Category>) =>
    request<import("@/types").Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<import("@/types").Category>) =>
    request<import("@/types").Category>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/categories/${id}`, { method: "DELETE" }),
};

// ─── Menus ────────────────────────────────────────────────────────────────────

export const menusApi = {
  list: () => request<import("@/types").Menu[]>("/menus"),
  get: (id: string) => request<import("@/types").Menu>(`/menus/${id}`),
  create: (data: { name: string; location: string }) =>
    request<import("@/types").Menu>("/menus", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<import("@/types").Menu>) =>
    request<import("@/types").Menu>(`/menus/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  syncItems: (id: string, items: import("@/types").MenuItem[]) =>
    request<import("@/types").Menu>(`/menus/${id}/items`, {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),
};

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settingsApi = {
  get: () =>
    request<import("@/types").SiteSetting>("/settings", { auth: false }),
  update: (data: Partial<import("@/types").SiteSetting>) =>
    request<import("@/types").SiteSetting>("/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// ─── Trial Registrations ──────────────────────────────────────────────────────

export const trialRegistrationsApi = {
  /** Public — submit from the modal */
  submit: (data: {
    name: string;
    phone: string;
    locationId?: string;
    source?: string;
  }) =>
    request<{ success: boolean; id: string }>("/public/trial-registrations", {
      method: "POST",
      auth: false,
      body: JSON.stringify(data),
    }),

  /** Admin — list all submissions */
  list: (params?: { page?: number; pageSize?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
    return request<
      import("@/types").PaginatedResponse<import("@/types").TrialRegistration>
    >(`/trial-registrations?${qs.toString()}`);
  },
};

// ─── Messaging — Subscribers ──────────────────────────────────────────────────

export const subscribersApi = {
  list: (params?: Record<string, string | number>) =>
    request<import("@/types").PaginatedResponse<import("@/types").Subscriber>>(
      `/messaging/subscribers?${new URLSearchParams(params as Record<string, string>)}`,
    ),
  get: (id: string) =>
    request<import("@/types").Subscriber>(`/messaging/subscribers/${id}`),
  create: (data: Partial<import("@/types").Subscriber>) =>
    request<import("@/types").Subscriber>("/messaging/subscribers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  import: (subscribers: Partial<import("@/types").Subscriber>[]) =>
    request<import("@/types").ImportResult>("/messaging/subscribers/import", {
      method: "POST",
      body: JSON.stringify({ subscribers }),
    }),
  update: (id: string, data: Partial<import("@/types").Subscriber>) =>
    request<import("@/types").Subscriber>(`/messaging/subscribers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/messaging/subscribers/${id}`, { method: "DELETE" }),
  getTags: () => request<string[]>("/messaging/subscribers/tags"),
};

// ─── Messaging — Campaigns ────────────────────────────────────────────────────

export const campaignsApi = {
  list: (params?: Record<string, string | number>) =>
    request<
      import("@/types").PaginatedResponse<import("@/types").MessageCampaign>
    >(
      `/messaging/campaigns?${new URLSearchParams(params as Record<string, string>)}`,
    ),
  get: (id: string) =>
    request<import("@/types").MessageCampaign>(`/messaging/campaigns/${id}`),
  getStats: (id: string) =>
    request<import("@/types").CampaignStats>(
      `/messaging/campaigns/${id}/stats`,
    ),
  create: (data: {
    title: string;
    platform: string;
    messageType?: string;
    content: Record<string, unknown>;
    targetTags?: string[];
    scheduledAt?: string;
  }) =>
    request<import("@/types").MessageCampaign>("/messaging/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Record<string, unknown>) =>
    request<import("@/types").MessageCampaign>(`/messaging/campaigns/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  send: (id: string) =>
    request<{ started: boolean; recipientCount: number }>(
      `/messaging/campaigns/${id}/send`,
      {
        method: "POST",
      },
    ),
  cancel: (id: string) =>
    request<void>(`/messaging/campaigns/${id}/cancel`, { method: "POST" }),
  delete: (id: string) =>
    request<void>(`/messaging/campaigns/${id}`, { method: "DELETE" }),
};

// ─── Messaging — Templates ────────────────────────────────────────────────────

export const templatesApi = {
  list: (platform?: string) =>
    request<import("@/types").MessageTemplate[]>(
      `/messaging/templates${platform ? `?platform=${platform}` : ""}`,
    ),
  get: (id: string) =>
    request<import("@/types").MessageTemplate>(`/messaging/templates/${id}`),
  create: (data: {
    name: string;
    platform: string;
    messageType?: string;
    content: Record<string, unknown>;
    isActive?: boolean;
  }) =>
    request<import("@/types").MessageTemplate>("/messaging/templates", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Record<string, unknown>) =>
    request<import("@/types").MessageTemplate>(`/messaging/templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/messaging/templates/${id}`, { method: "DELETE" }),
};

// ─── Locations ───────────────────────────────────────────────────────────────

export const locationsApi = {
  list: (params?: Record<string, string | number>) =>
    request<import("@/types").PaginatedResponse<import("@/types").Location>>(
      `/locations?${new URLSearchParams(params as Record<string, string>)}`,
    ),
  get: (id: string) => request<import("@/types").Location>(`/locations/${id}`),
  create: (data: Partial<import("@/types").Location>) =>
    request<import("@/types").Location>("/locations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<import("@/types").Location>) =>
    request<import("@/types").Location>(`/locations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/locations/${id}`, { method: "DELETE" }),
};

// ─── Promotions ──────────────────────────────────────────────────────────────

export const promotionsApi = {
  // Public
  getActive: () =>
    request<import("@/types").PromotionBanner | null>(
      "/public/promotions/active",
      { auth: false },
    ),

  // Admin
  list: (params?: Record<string, string | number>) =>
    request<
      import("@/types").PaginatedResponse<import("@/types").PromotionBanner>
    >(`/promotions?${new URLSearchParams(params as Record<string, string>)}`),
  get: (id: string) =>
    request<import("@/types").PromotionBanner>(`/promotions/${id}`),
  create: (data: Partial<import("@/types").PromotionBanner>) =>
    request<import("@/types").PromotionBanner>("/promotions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<import("@/types").PromotionBanner>) =>
    request<import("@/types").PromotionBanner>(`/promotions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  activate: (id: string) =>
    request<import("@/types").PromotionBanner>(`/promotions/${id}/activate`, {
      method: "POST",
    }),
  deactivate: (id: string) =>
    request<import("@/types").PromotionBanner>(`/promotions/${id}/deactivate`, {
      method: "POST",
    }),
  delete: (id: string) =>
    request<void>(`/promotions/${id}`, { method: "DELETE" }),
};

// ─── Legacy exports (kept for backward compat) ───────────────────────────────
// These were used in old AuthProvider — now the store owns the token.
/** @deprecated use useAuthStore from @/store/auth.store instead */
export const setAccessToken = setStoreToken;
/** @deprecated use useAuthStore from @/store/auth.store instead */
export const getAccessToken = getStoreToken;
