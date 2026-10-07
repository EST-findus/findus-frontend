import Image from "next/image";
import HealthCheckButton from "./HealthCheckButton";

export default function Header({ onLogin }: { onLogin: () => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-310 flex-wrap items-center gap-2.5 px-6 py-3 max-sm:px-4">
        <Image
          src="/images/findus-logo.png"
          alt=""
          width={32}
          height={32}
          className="shrink-0"
        />
        <span className="text-[18px] font-extrabold tracking-[-0.3px]">실종자 찾기 서비스</span>
        <span className="rounded-full bg-navy-soft px-2 py-0.5 text-[11px] font-bold text-navy">
          AI 몽타주
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-2.5">
          <HealthCheckButton />
          <button
            type="button"
            onClick={onLogin}
            className="rounded-full bg-navy px-4 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-navy-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            로그인
          </button>
        </div>
      </div>
    </header>
  );
}
