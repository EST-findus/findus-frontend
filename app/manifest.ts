import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "FindUs | 실종아동 찾기",
    short_name: "FindUs",
    description: "경찰청 공개 실종아동 정보와 등록 사진을 살펴보고 공식 제보 방법을 안내받는 서비스",
    lang: "ko",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F7F9FC",
    theme_color: "#3978B8",
    categories: ["social", "utilities"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "실종아동 찾기", url: "/search", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "정보 마당", url: "/community", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "이용 안내", url: "/help", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
