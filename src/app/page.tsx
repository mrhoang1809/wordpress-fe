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
