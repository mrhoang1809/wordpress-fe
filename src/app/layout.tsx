import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { TrialRegistrationModal } from "@/components/home/TrialRegistrationModal";
import { PublicProviders } from "@/components/home/PublicProviders";

// Be Vietnam Pro — Vietnamese-origin font, clean and elegant
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Curves Vietnam",
    template: "%s | Curves Vietnam",
  },
  description: "Hệ thống phòng tập 30 phút dành riêng cho phụ nữ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${beVietnamPro.variable} font-sans antialiased`}>
        <PublicProviders>
          <TrialRegistrationModal>
            <main className="min-h-screen">{children}</main>
          </TrialRegistrationModal>
        </PublicProviders>
      </body>
    </html>
  );
}
