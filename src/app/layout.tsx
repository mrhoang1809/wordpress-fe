import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { TrialRegistrationModal } from "@/components/home/TrialRegistrationModal";
import { PublicProviders } from "@/components/home/PublicProviders";
import { generateOrganizationSchema } from "@/lib/structured-data";

// Be Vietnam Pro — Vietnamese-origin font, clean and elegant
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Curves Vietnam - Phòng Tập 30 Phút Cho Phụ Nữ",
    template: "%s | Curves Vietnam",
  },
  description:
    "Hệ thống phòng tập 30 phút dành riêng cho phụ nữ. Bài tập 3 trong 1, không đàn ông, không gương soi. Giảm cân, cải thiện sức khỏe, tập luyện dễ dàng.",
  keywords: [
    "phòng tập nữ",
    "gym phụ nữ",
    "tập luyện 30 phút",
    "giảm cân",
    "machine kháng thủy lực",
    "Curves Vietnam",
  ],
  openGraph: {
    title: "Curves Vietnam - Phòng Tập 30 Phút Dành Cho Phụ Nữ",
    description:
      "Bài tập 3 trong 1: luyện tim mạch + sức mạnh + giãn cơ. Đốt cháy đến 500 calories trong 30 phút. Tập luyện trong không gian riêng tư, an toàn, vui vẻ.",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Curves Vietnam - Phòng Tập 30 Phút Cho Phụ Nữ",
    description:
      "Bài tập 3 trong 1: luyện tim mạch + sức mạnh + giãn cơ. Đốt cháy đến 500 calories trong 30 phút.",
    images: ["/logo.png"],
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://curvesvietnam.com.vn",
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://curvesvietnam.com.vn";
  const organizationSchema = generateOrganizationSchema(siteUrl);

  return (
    <html lang="vi">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
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
