import type { Location, Post, PublicPost, PublicPostCard } from "@/types";

const demoDate = "2026-10-01T00:00:00.000Z";
const storyCategory = { id: "demo-truyen-cam-hung", name: "Câu Chuyện Truyền Cảm Hứng", slug: "truyen-cam-hung" };

const demoStoryDetails = [
  ["Chị Minh Anh: Từ 60kg xuống 53kg chỉ sau 3 tháng", "chi-minh-anh-tu-60kg-xuong-53kg-chi-sau-3-thang", "Là nhân viên văn phòng bận rộn, chị đã duy trì tập luyện 30 phút và giảm được 6.5kg."],
  ["Cô Thanh Hương: Ở tuổi 52 vẫn khỏe mạnh và tràn đầy năng lượng", "co-thanh-huong-o-tuoi-52-van-khoe-manh-va-tran-day-nang-luong", "Hành trình tìm lại sức khỏe nhờ tập luyện đều đặn tại Curves Hà Nội."],
  ["Bạn Thu Thảo: Tự tin diện đồ ôm body sau hành trình giảm 9kg", "ban-thu-thao-tu-tin-dien-do-om-body-sau-hanh-trinh-giam-9kg", "Mỗi tuần ba buổi tập đã giúp Thảo tự tin hơn với vóc dáng của mình."],
  ["Chị Lan Phương: Giảm vòng eo 10cm sau 6 tháng", "chi-lan-phuong-giam-vong-eo-10cm-sau-6-thang", "Chị Lan Phương cải thiện vóc dáng và sức khỏe tại Curves Đà Nẵng."],
  ["Cô Mai Anh: Từ người phụ nữ tự ti đến tự tin rạng rỡ", "co-mai-anh-tu-nguoi-phu-nu-tu-ti-den-tu-tin-rang-ro", "Hành trình tìm lại niềm vui sống và sự tự tin sau khi tập luyện."],
  ["Chị Hoa: Từ 70kg xuống 60kg sau 4 tháng", "chi-hoa-tu-70kg-xuong-60kg-sau-4-thang", "Chị Hoa chia sẻ hành trình giảm cân bền vững tại Curves TP.HCM."],
  ["Cô Hồng: Cải thiện sức khỏe tim mạch nhờ Curves", "co-hong-cai-thien-suc-khoe-tim-mach-nho-curves", "Sức khỏe tim mạch cải thiện rõ rệt sau sáu tháng tập luyện."],
  ["Bạn Vy: Tự tin diện bikini mùa hè sau hành trình giảm 8kg", "ban-vy-tu-tin-dien-bikini-mua-he-sau-hanh-trinh-giam-8kg", "Vy đã tự tin hơn sau hành trình thay đổi thói quen vận động."],
  ["Chị Nguyệt: Từ mất ngủ đến khỏe mạnh mỗi sáng", "chi-nguyet-tu-mat-ngu-den-khoe-manh-moi-sang", "Giấc ngủ và nguồn năng lượng mỗi ngày được cải thiện nhờ Curves."],
  ["Cô Hạnh: Săn chắc cơ bắp sau sinh", "co-hanh-san-chac-co-bap-sau-sinh", "Cô Hạnh lấy lại vóc dáng khỏe khoắn sau sinh với chương trình phù hợp."],
] as const;

export const DEMO_STORIES: PublicPostCard[] = demoStoryDetails.map(([title, slug, excerpt], index) => ({
  id: `demo-story-${index + 1}`, title, slug, excerpt, publishedAt: demoDate,
  author: { id: "demo-admin", firstName: "Curves", lastName: "Vietnam" }, categories: [storyCategory],
}));

export const DEMO_STORY_POSTS: Post[] = DEMO_STORIES.map((story) => ({
  id: story.id, title: story.title, slug: story.slug, excerpt: story.excerpt ?? undefined,
  status: "PUBLISHED", version: 1, publishedAt: story.publishedAt,
  createdAt: demoDate, updatedAt: demoDate, author: story.author ?? undefined,
}));

/**
 * The homepage and stories page fall back to demo cards when the CMS has no
 * published stories. Detail routes need the matching full post as well;
 * otherwise a demo card would lead to a 404 response from the API.
 */
export function getDemoStoryPost(slug: string): PublicPost | undefined {
  const story = DEMO_STORIES.find((item) => item.slug === slug);
  if (!story) return undefined;

  return {
    ...story,
    seo: {
      title: story.title,
      description: story.excerpt,
    },
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    blocks: [
      {
        id: `${story.id}-content`,
        type: "RICH_TEXT",
        order: 0,
        schemaVersion: 1,
        data: {
          schemaVersion: 1,
          width: "normal",
          spacing: "md",
          content: {
            type: "doc",
            content: [
              {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Hành trình thay đổi" }],
              },
              {
                type: "paragraph",
                content: [{ type: "text", text: story.excerpt ?? "" }],
              },
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Với lịch tập đều đặn và sự đồng hành của huấn luyện viên Curves, hội viên từng bước xây dựng thói quen vận động phù hợp với cuộc sống hằng ngày.",
                  },
                ],
              },
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Kết quả không chỉ là thay đổi về vóc dáng mà còn là sự tự tin, năng lượng và niềm vui khi chăm sóc sức khỏe của chính mình.",
                  },
                ],
              },
            ],
          },
        },
      },
    ],
  };
}

const demoLocationDetails = [
  ["Curves Nguyễn Đình Chiểu", "curves-nguyen-dinh-chieu", "63 Nguyễn Đình Chiểu, P. Đa Kao, Q.1, TP.HCM", "(028) 3820 1234"],
  ["Curves Lê Văn Sỹ", "curves-le-van-sy", "189 Lê Văn Sỹ, P. 13, Q. Phú Nhuận, TP.HCM", "(028) 3844 5678"],
  ["Curves Trần Não", "curves-tran-nao", "20 Trần Não, P. Bình An, TP. Thủ Đức, TP.HCM", "(028) 3740 9012"],
  ["Curves Kim Mã", "curves-kim-ma", "18 Kim Mã, Ba Đình, Hà Nội", "(024) 3726 3456"],
  ["Curves Tây Sơn", "curves-tay-son", "88 Tây Sơn, Đống Đa, Hà Nội", "(024) 3573 7890"],
  ["Curves Nguyễn Văn Linh", "curves-nguyen-van-linh", "45 Nguyễn Văn Linh, Hải Châu, Đà Nẵng", "(0236) 3888 012"],
  ["Curves Lê Lợi", "curves-le-loi", "27 Lê Lợi, Thanh Hóa", "(0237) 3912 345"],
  ["Curves Nguyễn Trãi", "curves-nguyen-trai", "234 Nguyễn Trãi, Q.5, TP.HCM", "(028) 3830 5678"],
  ["Curves Pasteur", "curves-pasteur", "100 Pasteur, Q.1, TP.HCM", "(028) 3822 3456"],
  ["Curves Hoàng Diệu", "curves-hoang-dieu", "125 Hoàng Diệu, Q.4, TP.HCM", "(028) 3835 6789"],
] as const;

export const DEMO_LOCATIONS: Location[] = demoLocationDetails.map(([name, slug, address, phone], index) => ({
  id: `demo-location-${index + 1}`, name, slug, address, phone, order: index + 1,
  isActive: true, createdAt: demoDate, updatedAt: demoDate,
}));
