import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Noto_Sans_KR } from "next/font/google";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import Header from "@/components/Header";
import "./globals.css";
import "./official-palette.css";
import RoutePalette from "@/components/RoutePalette";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["500", "700", "800"],
  display: "swap",
  preload: false,
});

const title = "FindUs | 실종아동 찾기";
const description =
  "경찰청 공개 실종아동 정보와 등록 사진을 살펴보고 공식 제보 방법을 안내받는 서비스";
const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (deploymentHost ? `https://${deploymentHost}` : "http://localhost:3000");
const shareImage = {
  url: "/images/findus-share.png",
  width: 1200,
  height: 630,
  alt: "findus — 실종자 찾기 및 AI 예상 몽타주 서비스",
  type: "image/png",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "findus",
  title: { default: title, template: "%s | FindUs" },
  description,
  keywords: ["실종아동", "장기 실종아동", "실종아동 찾기", "AI 예상 모습", "나이 변환", "실종 제보", "FindUs"],
  alternates: { canonical: "/" },
  appleWebApp: { capable: true, title: "FindUs", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "findus",
    title,
    description,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [shareImage],
  },
};

export const viewport: Viewport = {
  themeColor: "#3978B8",
  width: "device-width",
  initialScale: 1,
  // 하단 내비게이션이 env(safe-area-inset-bottom)을 쓰므로 노치·홈 바 영역까지 화면을 채운다.
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body
        className={`${pretendard.variable} ${notoSansKr.variable} flex min-h-dvh flex-col bg-page font-sans text-ink antialiased`}
      >
        <RoutePalette />
        <Header />
        {children}
        <Footer />
        <MobileBottomNav />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
