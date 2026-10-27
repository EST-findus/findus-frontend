import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:18080";

const nextConfig: NextConfig = {
  images: {
    // 원본 JPEG이 이미 압축돼 있어 기본 품질(75)로 다시 압축하면 얼굴이 뭉개진다. 사진은 90으로 쓰고 AVIF를 우선 내보낸다.
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // 공유 이미지(lib/shareImage.tsx)가 런타임에 읽는 폰트·로고를 배포 번들에 포함한다.
  outputFileTracingIncludes: {
    "/missing/**": [
      "./node_modules/pretendard/dist/web/static/woff/Pretendard-{Medium,Bold,ExtraBold}.woff",
      "./public/images/findus-mark.svg",
      "./public/images/mock-persons/**/*.jpg",
    ],
  },
  // 서비스 소개는 실종아동 찾기로, 제보·AI 안내는 이용 안내(/help)로 합쳤다. 예전 주소로 들어와도 이어지게 한다.
  async redirects() {
    return [
      { source: "/about", destination: "/search", permanent: false },
      { source: "/guide", destination: "/help", permanent: false },
      { source: "/ai", destination: "/help?tab=ai", permanent: false },
    ];
  },
  // 브라우저에서 백엔드를 직접 호출하면 CORS(403)로 막히므로 같은 오리진으로 프록시한다.
  async rewrites() {
    return [{ source: "/backend/:path*", destination: `${BACKEND_URL}/:path*` }];
  },
};

export default nextConfig;
