/**
 * Public route layout
 *
 * Shared layout for all public-facing routes under (public)/:
 *   /blog, /blog/[slug], /[...slug] (CMS pages)
 *
 * These routes inherit Header/Footer/FloatingPromotionButton from root layout,
 * so this layout only wraps content without duplicating them.
 */
import FloatingPromotionButton from "@/components/home/FloatingPromotionButton";
import { FloatingContactButtons } from "@/components/home/FloatingContactButtons";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";
import { TrialRegistrationModal } from "@/components/home/TrialRegistrationModal";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TrialRegistrationModal>
      <Header />
      {/* Promotion: góc phải */}
      <FloatingPromotionButton />
      {/* Contact: góc trái */}
      <FloatingContactButtons />
      {children}
      <Footer />
    </TrialRegistrationModal>
  );
}
