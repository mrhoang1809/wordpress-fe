import type { PaginatedResponse, PaginationMeta } from '@/types';

export function unwrapList<T>(payload: PaginatedResponse<T> | T[] | undefined | null): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

export function unwrapMeta(
  payload: PaginatedResponse<unknown> | undefined | null,
): PaginationMeta | null {
  if (!payload || Array.isArray(payload) || !payload.meta) return null;
  return payload.meta;
}
