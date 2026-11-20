import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/home/AnnouncementBar";
import { Header } from "@/components/home/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { WorkoutSection } from "@/components/home/WorkoutSection";
import { AdvantagesSection } from "@/components/home/AdvantagesSection";
import { BmiCalculatorSection } from "@/components/home/BmiCalculatorSection";
import { LocationsSection } from "@/components/home/LocationsSection";
import { SuccessStoriesSection } from "@/components/home/SuccessStoriesSection";
import { PromotionCountdownSection } from "@/components/home/PromotionCountdownSection";
import { FaqSection } from "@/components/home/FaqSection";
import { Footer } from "@/components/home/Footer";
import { TrialRegistrationModal } from "@/components/home/TrialRegistrationModal";
import FloatingPromotionButton from "@/components/home/FloatingPromotionButton";
import { FloatingContactButtons } from "@/components/home/FloatingContactButtons";

/**
 * Homepage — Curves Vietnam
 *
 * HomeProviders supplies a TanStack QueryClient for useQuery hooks
 * (PromotionCountdownSection fetches the active banner from the API).
 *
 * TrialRegistrationModal provides the modal context used by all child
 * components that open the trial registration form.
 */

export const metadata: Metadata = {
  title: "Curves Vietnam - Phòng Tập 30 Phút Dành Cho Phụ Nữ",
  description:
    "Phòng tập chuyên biệt dành riêng cho phụ nữ. Bài tập 3 trong 1 trong 30 phút giúp đốt cháy đến 500 calories. Không đàn ông, không gương soi, không trang điểm. Miễn phí tư vấn và hướng dẫn.",
  keywords: [
    "phòng tập nữ",
    "gym phụ nữ",
    "tập luyện 30 phút",
    "giảm cân",
    "cải thiện sức khỏe",
    "Curves Vietnam",
  ],
  openGraph: {
    title: "Curves Vietnam - Phòng Tập 30 Phút Dành Cho Phụ Nữ",
    description:
      "Bài tập 3 trong 1: luyện tim mạch + sức mạnh + giãn cơ. Đốt cháy đến 500 calories trong 30 phút.",
    images: ["/logo.png"],
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <main className="bg-slate-50 text-slate-800 antialiased">
      <Header />
      <FloatingPromotionButton />
      <FloatingContactButtons />
      <HeroSection />
      <WorkoutSection />
      <AdvantagesSection />
      <BmiCalculatorSection />
      <LocationsSection />
      <SuccessStoriesSection />
      <PromotionCountdownSection />
      <FaqSection />
      <Footer />
    </main>
  );
}
