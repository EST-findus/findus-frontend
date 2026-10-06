import HealthCheckButton from "./HealthCheckButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1240px] items-center gap-2.5 px-6 py-3 max-sm:px-4">
        <span aria-hidden="true" className="h-7 w-7 rounded-[7px] bg-navy" />
        <span className="text-[18px] font-extrabold tracking-[-0.3px]">실종자 찾기 서비스</span>
        <span className="rounded-full bg-navy-soft px-2 py-0.5 text-[11px] font-bold text-navy">
          AI 몽타주
        </span>
        <HealthCheckButton />
      </div>
    </header>
  );
}
