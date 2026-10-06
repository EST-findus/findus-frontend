import type { Metadata } from "next";
import localFont from "next/font/local";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

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

const title = "findus | 실종자 찾기 및 AI 예상 몽타주 시스템";
const description =
  "실종 당시 사진과 AI가 예측한 현재 모습을 비교하고 목격 정보를 제보할 수 있는 실종자 검색 서비스";
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
  title,
  description,
  alternates: { canonical: "/" },
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body
        className={`${pretendard.variable} ${notoSansKr.variable} bg-page font-sans text-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
