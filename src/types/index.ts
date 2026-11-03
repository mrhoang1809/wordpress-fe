// ─── Block Types (mirrors backend contracts) ──────────────────────────────────

export type BlockType =
  | "HERO"
  | "BANNER"
  | "RICH_TEXT"
  | "IMAGE"
  | "CTA"
  | "FAQ";
export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type RoleName = "ADMIN" | "EDITOR" | "AUTHOR";

export interface ButtonConfig {
  label: string;
  url: string;
  openInNewTab?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

export type SpacingSize = "none" | "sm" | "md" | "lg" | "xl";
export type HorizontalAlignment = "left" | "center" | "right";
export type WidthConstraint = "narrow" | "normal" | "wide" | "full";

export interface HeroBlockData {
  schemaVersion: 1;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  imageMediaId?: string;
  imageAlt?: string;
  primaryButton?: ButtonConfig;
  secondaryButton?: ButtonConfig;
  layout?: "image-right" | "image-left" | "image-top" | "image-background";
  alignment?: HorizontalAlignment;
  theme?: "light" | "dark";
  backgroundColor?: string;
  spacing?: SpacingSize;
}

export interface BannerBlockData {
  schemaVersion: 1;
  title: string;
  description?: string;
  imageUrl?: string;
  imageMediaId?: string;
  imageAlt?: string;
  backgroundType?: "color" | "image";
  backgroundColor?: string;
  textColor?: string;
  cta?: ButtonConfig;
  alignment?: HorizontalAlignment;
  overlayOpacity?: number;
  spacing?: SpacingSize;
}

export interface RichTextBlockData {
  schemaVersion: 1;
  content: Record<string, unknown>;
  alignment?: HorizontalAlignment;
  width?: WidthConstraint;
  spacing?: SpacingSize;
}

export interface ImageBlockData {
  schemaVersion: 1;
  imageUrl: string;
  imageMediaId?: string;
  alt: string;
  caption?: string;
  link?: string;
  aspectRatio?: "1/1" | "4/3" | "16/9" | "3/2" | "auto";
  objectFit?: "cover" | "contain" | "fill";
  alignment?: HorizontalAlignment;
  width?: WidthConstraint;
  spacing?: SpacingSize;
}

export interface CtaBlockData {
  schemaVersion: 1;
  title: string;
  description?: string;
  primaryButton?: ButtonConfig;
  secondaryButton?: ButtonConfig;
  layout?: "stacked" | "inline";
  theme?: "light" | "dark" | "brand";
  backgroundColor?: string;
  spacing?: SpacingSize;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqBlockData {
  schemaVersion: 1;
  title?: string;
  description?: string;
  items: FaqItem[];
  displayStyle?: "accordion" | "list";
  allowMultipleOpen?: boolean;
  spacing?: SpacingSize;
}

export type PageBlockData =
  | ({ type: "HERO" } & HeroBlockData)
  | ({ type: "BANNER" } & BannerBlockData)
  | ({ type: "RICH_TEXT" } & RichTextBlockData)
  | ({ type: "IMAGE" } & ImageBlockData)
  | ({ type: "CTA" } & CtaBlockData)
  | ({ type: "FAQ" } & FaqBlockData);

export interface PageBlock {
  id: string;
  type: BlockType;
  order: number;
  schemaVersion: number;
  data: Record<string, unknown>;
}

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface MediaItem {
  id: string;
  url: string;
  altText?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  caption?: string;
  createdAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: ContentStatus;
  featuredImage?: { id: string; url: string; altText?: string } | null;
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: string;
  version: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  blocks?: PageBlock[];
}

export interface PublicPage {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: ContentStatus;
  featuredImage?: { url: string; altText?: string } | null;
  seo: { title: string; description?: string | null; image?: string | null };
  publishedAt?: string | null;
  blocks: PageBlock[];
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: ContentStatus;
  featuredImage?: { id: string; url: string; altText?: string } | null;
  version: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; firstName: string; lastName: string };
  blocks?: PageBlock[];
}

/** Public post card (used in blog listing) */
export interface PublicPostCard {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: { url: string; altText?: string | null } | null;
  publishedAt?: string | null;
  author?: { id: string; firstName: string; lastName: string } | null;
  categories: { id: string; name: string; slug: string }[];
}

/** Full public post detail */
export interface PublicPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: { url: string; altText?: string | null } | null;
  publishedAt?: string | null;
  author?: { id: string; firstName: string; lastName: string } | null;
  categories: { id: string; name: string; slug: string }[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  seo: { title: string; description?: string | null; image?: string | null };
  blocks: PageBlock[];
}

export interface PublicPostComment {
  id: string;
  name: string;
  text: string;
  createdAt: string;
}

export interface PublicPostEngagement {
  viewCount: number;
  likeCount: number;
  commentCount: number;
  comments: PublicPostComment[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  order: number;
  isActive: boolean;
  children?: Category[];
  image?: { url: string; altText?: string } | null;
}

export interface MenuItem {
  id: string;
  label: string;
  type: "PAGE" | "POST" | "CATEGORY" | "CUSTOM_URL";
  parentId?: string | null;
  order: number;
  pageId?: string;
  postId?: string;
  categoryId?: string;
  customUrl?: string;
  openInNewTab: boolean;
  isActive: boolean;
  children?: MenuItem[];
}

export interface Menu {
  id: string;
  name: string;
  location: "HEADER" | "FOOTER" | "SIDEBAR" | "CUSTOM";
  isActive: boolean;
  items: MenuItem[];
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: RoleName[];
  permissions: string[];
}

export interface SiteSetting {
  id: string;
  siteName: string;
  siteDescription?: string;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  defaultSeoImage?: string;
  logo?: MediaItem | null;
  favicon?: MediaItem | null;
  socialLinks?: Record<string, string> | null;
  // ── Contact / Float buttons ──────────────────────────────
  hotline?: string | null;
  zaloUrl?: string | null;
  facebookUrl?: string | null;
  // ── Trial registration notifications ─────────────────────
  trialNotifyEmail?: string | null;
}

// ─── Trial Registration ───────────────────────────────────────────────────────

export interface TrialRegistration {
  id: string;
  name: string;
  phone: string;
  locationId?: string | null;
  source?: string | null;
  createdAt: string;
  location?: { name: string; address: string } | null;
}

// ─── Messaging ─────────────────────────────────────────────────────────────────

export type MessagePlatform = "ZALO" | "FACEBOOK";
export type CampaignStatus =
  | "DRAFT"
  | "QUEUED"
  | "SENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";
export type DeliveryStatus =
  | "PENDING"
  | "SENT"
  | "FAILED"
  | "DELIVERED"
  | "READ";

export interface Subscriber {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  zaloUserId?: string | null;
  facebookPsid?: string | null;
  tags: string[];
  isActive: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessageCampaign {
  id: string;
  title: string;
  platform: MessagePlatform;
  status: CampaignStatus;
  messageType: string;
  content: Record<string, unknown>;
  targetTags: string[];
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  scheduledAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdBy?: { id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
  recipients?: MessageRecipient[];
}

export interface MessageRecipient {
  id: string;
  campaignId: string;
  subscriberId: string;
  subscriber?: {
    id: string;
    name: string;
    phone?: string | null;
    zaloUserId?: string | null;
    facebookPsid?: string | null;
  };
  status: DeliveryStatus;
  platformMessageId?: string | null;
  errorMessage?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
}

export interface CampaignStats {
  total: number;
  pending: number;
  sent: number;
  failed: number;
  delivered: number;
  read: number;
  sentCount: number;
  failedCount: number;
  status: CampaignStatus;
}

export interface MessageTemplate {
  id: string;
  name: string;
  platform: MessagePlatform;
  messageType: string;
  content: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ImportResult {
  created: number;
  skipped: number;
}

// ─── Locations / Chi Nhánh ────────────────────────────────────────────────────

export interface Location {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Promotions ────────────────────────────────────────────────────────────────

export interface PromotionBanner {
  id: string;
  badgeText: string;
  headline: string;
  description?: string | null;
  ctaLabel: string;
  ctaSource: string;
  countdownLabel: string;
  endsAt: string;
  bgGradientFrom: string;
  bgGradientVia: string;
  bgGradientTo: string;
  badgeBg: string;
  badgeText2: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response types ────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  statusCode: number;
  message: string;
  details?: { field: string; message: string }[];
}
