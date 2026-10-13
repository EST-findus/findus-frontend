import type { Metadata } from "next";
import PostDetail from "@/components/PostDetail";
import { getSeedPosts } from "@/lib/community";

interface Props {
  params: Promise<{ id: string }>;
}

const findSeed = (id: string) => getSeedPosts().find((p) => p.id === id);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: findSeed(id)?.title ?? "커뮤니티",
    alternates: { canonical: `/community/${id}` },
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  return (
    <main className="pt-14 max-sm:pt-8">
      <div className="page-container max-w-220">
        <PostDetail id={id} initialPost={findSeed(id)} />
      </div>
    </main>
  );
}
