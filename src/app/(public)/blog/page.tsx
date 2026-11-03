import type { Metadata } from "next";
import { Suspense } from "react";
import { publicApi } from "@/lib/api-client";
import { Blog } from "@/components/blog/Blog";
import type { PaginatedResponse, PublicPostCard, Category } from "@/types";

export const metadata: Metadata = {
  title: "Blog Sức Khỏe & Vóc Dáng | Curves Vietnam",
  description:
    "Cập nhật hàng ngày mẹo giảm mỡ, thực đơn Eat Clean, kiến thức tập luyện 30 phút và câu chuyện truyền cảm hứng từ cộng đồng nữ giới Curves.",
  robots: { index: true, follow: true },
};

export const revalidate = 60; // 1 minute

interface Props {
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
  }>;
}

async function fetchData(params: {
  page?: string;
  category?: string;
  search?: string;
}): Promise<{
  posts: PaginatedResponse<PublicPostCard>;
  categories: Category[];
}> {
  const [posts, categories] = await Promise.all([
    publicApi
      .listPosts({
        page: params.page ? parseInt(params.page, 10) : 1,
        pageSize: 12,
        // Default to tin-tuc. User can switch tabs to see other categories.
        categorySlug: params.category || "tin-tuc",
        search: params.search || undefined,
      })
      .catch(() => ({
        data: [] as PublicPostCard[],
        meta: { total: 0, page: 1, pageSize: 12, totalPages: 0 },
      })),
    publicApi.getCategoryTree().catch(() => [] as Category[]),
  ]);
  return { posts, categories };
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const { posts, categories } = await fetchData(params);

  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-muted-foreground">
          Đang tải...
        </div>
      }
    >
      <Blog
        initialData={posts}
        categories={categories}
        initialCategory={params.category ?? "tin-tuc"}
        initialSearch={params.search ?? ""}
      />
    </Suspense>
  );
}
