import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PostForm from "@/components/PostForm";

export const metadata: Metadata = {
  title: "글쓰기",
  description: "FindUs 커뮤니티에 정보와 이야기를 남겨 주세요.",
  robots: { index: false },
};

export default function WritePage() {
  return (
    <main className="pb-24 max-sm:pb-16">
      <PageHero compact overlap eyebrow="커뮤니티 · 글쓰기" title="이야기를 나눠 주세요" />
      <div className="page-container relative z-10 -mt-12 max-w-220 max-sm:-mt-10">
        <PostForm />
      </div>
    </main>
  );
}
