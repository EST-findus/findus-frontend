"use client";

import { useState, type FormEvent } from "react";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // 인증 API 계약이 확정되면 이 지점에서 로그인 요청을 연결합니다.
    setMessage("로그인 서비스가 준비 중입니다. 현재는 실종자 검색을 로그인 없이 이용해 주세요.");
  }

  const inputClassName = "mt-2 w-full rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-subtle focus:border-navy focus:ring-2 focus:ring-navy/15";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 [@media(max-height:700px)]:space-y-3">
      <div>
        <label htmlFor="login-email" className="text-sm font-semibold">이메일</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="이메일 주소를 입력해 주세요"
          required
          maxLength={254}
          className={inputClassName}
          onChange={() => setMessage(null)}
        />
      </div>
      <div>
        <label htmlFor="login-password" className="text-sm font-semibold">비밀번호</label>
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="비밀번호를 입력해 주세요"
            required
            className={inputClassName + " pr-20"}
            onChange={() => setMessage(null)}
          />
          <button
            type="button"
            aria-label="비밀번호 표시"
            aria-pressed={showPassword}
            aria-controls="login-password"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute top-1/2 right-3 mt-1 -translate-y-1/2 rounded px-1 py-2 text-xs font-semibold text-muted hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            {showPassword ? "숨기기" : "보기"}
          </button>
        </div>
      </div>
      <label htmlFor="login-remember" className="flex w-fit cursor-pointer items-center gap-2 text-sm text-muted">
        <input
          id="login-remember"
          name="rememberMe"
          type="checkbox"
          checked={rememberMe}
          onChange={(event) => {
            setRememberMe(event.target.checked);
            setMessage(event.target.checked ? "로그인 상태 유지 기능은 로그인 서비스 연결 후 사용할 수 있습니다." : null);
          }}
          className="h-4 w-4 cursor-pointer rounded border-line accent-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        />
        로그인 상태 유지
      </label>
      <p role="status" aria-live="polite" aria-atomic="true" className="text-xs leading-5 text-muted">
        {message ?? "현재 로그인 서비스는 준비 중입니다."}
      </p>
      <button
        type="submit"
        className="w-full rounded-lg bg-navy px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-navy-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        로그인
      </button>
      <div role="group" aria-label="계정 도움말" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted">
        {["아이디 찾기", "비밀번호 찾기", "회원가입"].map((label, index) => (
          <span key={label} className="inline-flex items-center gap-3">
            {index > 0 && <span aria-hidden="true" className="text-line">|</span>}
            <button
              type="button"
              onClick={() => setMessage(label + " 기능은 준비 중입니다.")}
              className="min-h-8 rounded px-1 font-medium transition-colors hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
            >
              {label}
            </button>
          </span>
        ))}
      </div>
    </form>
  );
}
