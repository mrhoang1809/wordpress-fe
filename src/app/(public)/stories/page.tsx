import type { Metadata } from "next";
import { Suspense } from "react";
import { publicApi } from "@/lib/api-client";
import type { PaginatedResponse, PublicPostCard, Category } from "@/types";
import { StoriesList } from "@/components/blog/StoriesList";

export const metadata: Metadata = {
  title: "Câu Chuyện Truyền Cảm Hứng | Curves Vietnam",
  description:
    "Hành trình thay đổi của hàng ngàn hội viên Curves - từ giảm cân, cải thiện sức khỏe đến tìm lại niềm vui sống.",
  robots: { index: true, follow: true },
};

export const revalidate = 60; // 1 minute

interface Props {
  searchParams: Promise<{
    page?: string;
  }>;
}

async function fetchData(params: { page?: string }): Promise<{
  posts: PaginatedResponse<PublicPostCard>;
  categories: Category[];
}> {
  const [posts, categories] = await Promise.all([
    publicApi
      .listPosts({
        page: params.page ? parseInt(params.page, 10) : 1,
        pageSize: 12,
        categorySlug: "truyen-cam-hung",
      })
      .catch(() => ({
        data: [] as PublicPostCard[],
        meta: { total: 0, page: 1, pageSize: 12, totalPages: 0 },
      })),
    publicApi.getCategoryTree().catch(() => [] as Category[]),
  ]);
  return { posts, categories };
}

export default async function StoriesPage({ searchParams }: Props) {
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
      <StoriesPageContent initialData={posts} categories={categories} />
    </Suspense>
  );
}

function StoriesPageContent({
  initialData,
  categories,
}: {
  initialData: PaginatedResponse<PublicPostCard>;
  categories: Category[];
}) {
  return (
    <>
      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section className="bg-mesh-gradient text-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden noise-overlay">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-accent-magenta/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-brand-600/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-5">
          <span className="section-eyebrow">Hành Trình Truyền Cảm Hứng</span>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.0]">
            Câu Chuyện
            <br />
            <span className="gradient-text">Truyền Cảm Hứng</span>
          </h1>
          <p className="text-white/55 max-w-xl mx-auto text-[15px] leading-relaxed">
            Hành trình thay đổi của hàng ngàn hội viên Curves — từ giảm cân, cải
            thiện sức khỏe đến tìm lại niềm vui sống.
          </p>
        </div>
      </section>

      {/* ── Stories List (Client Component) ───────────────────────────────────── */}
      <StoriesList initialData={initialData} />
    </>
  );
}
