'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pagesApi } from '@/lib/api-client';
import type { Page, PageBlock, PaginatedResponse } from '@/types';

export function usePages(params: Record<string, string | number>) {
  return useQuery<PaginatedResponse<Page>>({
    queryKey: ['pages', params],
    queryFn: () => pagesApi.list(params),
  });
}

export function usePage(id: string) {
  return useQuery<Page>({
    queryKey: ['page', id],
    queryFn: () => pagesApi.get(id),
    enabled: !!id,
  });
}

export function usePageBlocks(id: string) {
  return useQuery<PageBlock[]>({
    queryKey: ['pageBlocks', id],
    queryFn: () => pagesApi.getBlocks(id),
    enabled: !!id,
  });
}

export function useCreatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Page>) => pagesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages'] }),
  });
}

export function useUpdatePage(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Page>) => pagesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      qc.invalidateQueries({ queryKey: ['page', id] });
    },
  });
}

export function useDeletePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pagesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages'] }),
  });
}

export function usePublishPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pagesApi.publish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages'] }),
  });
}

export function useUnpublishPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pagesApi.unpublish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages'] }),
  });
}

export function useDuplicatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pagesApi.duplicate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages'] }),
  });
}

export function useSyncBlocks(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ version, blocks }: { version: number; blocks: PageBlock[] }) =>
      pagesApi.syncBlocks(pageId, version, blocks),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['page', pageId] });
      qc.invalidateQueries({ queryKey: ['pageBlocks', pageId] });
      qc.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}
