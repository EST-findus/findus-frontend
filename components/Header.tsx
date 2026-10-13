import Image from "next/image";
import Link from "next/link";
import { SAFE182_URL } from "@/lib/links";
import HealthCheckButton from "./HealthCheckButton";
import HeaderNav from "./HeaderNav";
import { ArrowUpRightIcon, PhoneIcon } from "./Icons";

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <Image src="/images/findus-logo.png" alt="" width={30} height={30} className="shrink-0" />
      <span className="text-[21px] font-extrabold tracking-[-0.4px]">
        <span className="text-brand">Find</span>
        <span className="text-gold">Us</span>
      </span>
    </span>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-310 items-center gap-4 px-6 py-1.5 text-[12px] text-muted max-sm:px-4">
          <p className="break-keep max-sm:hidden">오래된 기억도, 다시 단서가 되도록</p>
          <div className="ml-auto flex items-center gap-4">
            <HealthCheckButton />
            <a
              href={SAFE182_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 font-semibold hover:text-brand"
            >
              안전Dream <ArrowUpRightIcon size={13} strokeWidth={2.2} />
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-310 items-center gap-6 px-6 py-3.5 max-md:flex-wrap max-md:gap-y-2 max-sm:px-4">
        <Link
          href="/"
          aria-label="FindUs 홈"
          className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <Logo />
        </Link>
        <HeaderNav />
        <a
          href="tel:182"
          className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-line py-1.5 pr-4 pl-1.5 text-[13px] font-semibold transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:order-last md:ml-0"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-soft text-brand">
            <PhoneIcon size={13} strokeWidth={2.2} />
          </span>
          공식 제보 <span className="text-[15px] font-extrabold text-brand">182</span>
        </a>
      </div>
    </header>
  );
}
