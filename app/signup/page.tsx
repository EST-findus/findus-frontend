import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import { safeNextPath } from "@/lib/auth";

export const metadata: Metadata = {
  title: "회원가입",
  robots: { index: false },
};

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function SignUpPage({ searchParams }: Props) {
  const { next } = await searchParams;
  return (
    <main className="page-container pt-16 max-sm:pt-10">
      <AuthForm mode="signup" next={safeNextPath(next)} />
    </main>
  );
}
