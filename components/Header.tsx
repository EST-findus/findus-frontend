import SiteBrand from "./SiteBrand";
import Link from "next/link";
import HealthCheckButton from "./HealthCheckButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-310 flex-wrap items-center gap-2.5 px-6 py-3 max-sm:px-4">
        <SiteBrand />
        <div className="ml-auto flex shrink-0 items-center gap-2.5">
          <HealthCheckButton />
          <Link
            href="/login"
            className="rounded-full bg-navy px-4 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-navy-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            로그인
          </Link>
        </div>
      </div>
    </header>
  );
}
