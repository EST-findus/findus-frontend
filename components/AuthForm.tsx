"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AUTH_LIMITS, logIn, signUp, validateLogIn, validateSignUp } from "@/lib/auth";
import { useCurrentUser } from "@/lib/useCurrentUser";
import LogoMark from "./LogoMark";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const FIELD =
  "mt-2 h-12 w-full rounded-xl border border-line bg-card px-4 text-[15px] placeholder:text-subtle focus:border-brand focus:outline-none";

type Mode = "login" | "signup";

const COPY: Record<Mode, { title: string; description: string; submit: string }> = {
  login: {
    title: "로그인",
    description: "로그인하면 커뮤니티에 글과 댓글을 남길 수 있어요.",
    submit: "로그인",
  },
  signup: {
    title: "회원가입",
    description: "함께 기억하고 나누는 FindUs 커뮤니티에 오신 것을 환영해요.",
    submit: "가입하기",
  },
};

export default function AuthForm({ mode, next }: { mode: Mode; next: string }) {
  const router = useRouter();
  const user = useCurrentUser();
  const [values, setValues] = useState({ email: "", password: "", passwordConfirm: "", nickname: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const copy = COPY[mode];
  const isSignUp = mode === "signup";

  // 이미 로그인한 상태로 들어오면(가입·로그인 직후 포함) 돌아갈 곳으로 보낸다.
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);
  const otherQuery = next === "/" ? "" : `?next=${encodeURIComponent(next)}`;

  const field = (key: keyof typeof values) => ({
    id: `auth-${key}`,
    value: values[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [key]: e.target.value })),
    "aria-describedby": error ? "auth-error" : undefined,
    className: FIELD,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = isSignUp ? validateSignUp(values) : validateLogIn(values);
    if (invalid) {
      setError(invalid);
      return;
    }
    setPending(true);
    try {
      // 이동은 위 useEffect가 로그인 상태 변화를 보고 처리한다.
      await (isSignUp ? signUp(values) : logIn(values));
    } catch (err) {
      setError(err instanceof Error ? err.message : "잠시 후 다시 시도해 주세요.");
      setPending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-110 rounded-3xl border border-line bg-card p-10 shadow-panel max-sm:border-0 max-sm:p-0 max-sm:shadow-none">
      <div className="text-center">
        <LogoMark size={44} className="mx-auto" />
        <h1 className="mt-4 text-[26px] font-extrabold tracking-[-0.02em]">{copy.title}</h1>
        <p className="mt-2 text-[14px] leading-relaxed break-keep text-muted">{copy.description}</p>
      </div>

      <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-5">
        <div>
          <label htmlFor="auth-email" className="text-[14px] font-bold">
            이메일
          </label>
          <input {...field("email")} type="email" autoComplete="email" placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="auth-password" className="text-[14px] font-bold">
            비밀번호
          </label>
          <input
            {...field("password")}
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            maxLength={AUTH_LIMITS.password.max}
            placeholder={isSignUp ? "영문·숫자 포함 8자 이상" : "비밀번호"}
          />
        </div>
        {isSignUp && (
          <>
            <div>
              <label htmlFor="auth-passwordConfirm" className="text-[14px] font-bold">
                비밀번호 확인
              </label>
              <input
                {...field("passwordConfirm")}
                type="password"
                autoComplete="new-password"
                maxLength={AUTH_LIMITS.password.max}
                placeholder="비밀번호를 한 번 더 입력"
              />
            </div>
            <div>
              <label htmlFor="auth-nickname" className="text-[14px] font-bold">
                닉네임
              </label>
              <input
                {...field("nickname")}
                autoComplete="nickname"
                maxLength={AUTH_LIMITS.nickname.max}
                placeholder="커뮤니티에 표시될 이름 (2~12자)"
              />
            </div>
          </>
        )}

        <p id="auth-error" role="alert" className="-my-1 min-h-5 text-[13px] font-semibold text-red empty:min-h-0">
          {error}
        </p>

        <button
          type="submit"
          disabled={pending}
          className={`h-12 rounded-xl bg-brand text-[16px] font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60 ${FOCUS_RING}`}
        >
          {pending ? "처리 중…" : copy.submit}
        </button>
      </form>

      <p className="mt-6 text-center text-[14px] text-muted">
        {isSignUp ? "이미 회원이신가요?" : "아직 회원이 아니신가요?"}{" "}
        <Link
          href={`${isSignUp ? "/login" : "/signup"}${otherQuery}`}
          className={`rounded font-bold text-brand hover:underline ${FOCUS_RING}`}
        >
          {isSignUp ? "로그인" : "회원가입"}
        </Link>
      </p>
    </div>
  );
}
