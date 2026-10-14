import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:18080";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // 공유 이미지(lib/shareImage.tsx)가 런타임에 읽는 폰트·로고를 배포 번들에 포함한다.
  outputFileTracingIncludes: {
    "/missing/**": [
      "./node_modules/pretendard/dist/web/static/woff/Pretendard-{Medium,Bold,ExtraBold}.woff",
      "./public/images/findus-mark.svg",
    ],
  },
  // 브라우저에서 백엔드를 직접 호출하면 CORS(403)로 막히므로 같은 오리진으로 프록시한다.
  async rewrites() {
    return [{ source: "/backend/:path*", destination: `${BACKEND_URL}/:path*` }];
  },
};

export default nextConfig;
