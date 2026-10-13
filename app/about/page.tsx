import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  HeartIcon,
  HomeIcon,
  LayersIcon,
  PhoneIcon,
  SearchIcon,
} from "@/components/Icons";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "서비스 소개",
  description: "오래된 기억이 가족을 잇는 단서가 되도록, FindUs가 하는 일을 소개합니다.",
  alternates: { canonical: "/about" },
};

const QUICK_LINKS = [
  {
    href: "/guide#know",
    icon: SearchIcon,
    title: "이 사람을 알아요",
    text: "목격 단서를 공식 제보로 연결해요",
  },
  {
    href: "/guide#me",
    icon: HeartIcon,
    title: "혹시 나?",
    text: "나의 과거가 궁금하다면 상담부터",
  },
  {
    href: "/guide#families",
    icon: HomeIcon,
    title: "가족·보호자 안내",
    text: "정보 확인부터 공유까지 함께해요",
  },
];

const FEATURES = [
  {
    icon: LayersIcon,
    title: "사진 3장 비교",
    text: "실종 당시 원본, AI 예상 모습, 스타일 변형을 한 화면에서 나란히 봅니다.",
  },
  {
    icon: SearchIcon,
    title: "기억나는 정보로 검색",
    text: "이름을 몰라도 성별, 실종 지역, 연도, 당시 나이로 좁혀 찾을 수 있어요.",
  },
  {
    icon: PhoneIcon,
    title: "공식 제보로 연결",
    text: "목격 제보를 남기거나 경찰청 182·안전Dream으로 바로 이어집니다.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <section className="bg-hero">
        <div className="mx-auto grid max-w-310 items-center gap-10 px-6 py-16 md:grid-cols-[1fr_auto] max-sm:px-4 max-sm:py-12">
          <div>
            <p className="mb-4 flex items-center gap-2 text-[13px] font-bold text-brand">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand" />
              장기 실종아동 찾기 지원 서비스
            </p>
            <h1 className="text-[44px] leading-tight font-extrabold tracking-[-1.2px] break-keep max-sm:text-[32px]">
              기억을 잇고,
              <br />
              다시 만날 수 있도록.
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed break-keep text-muted max-sm:text-[15px]">
              시간이 흘러도, 기다림은 이어집니다.
              <br />
              작은 관심과 오래된 기억이 가족을 잇는 단서가 됩니다.
            </p>
            <Link
              href="/"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              실종아동 정보 찾아보기 <ArrowRightIcon size={17} strokeWidth={2.2} />
            </Link>
          </div>
          <div
            aria-hidden="true"
            className="flex h-64 w-64 items-center justify-center rounded-full bg-card shadow-card max-md:hidden"
          >
            <Image src="/images/findus-logo.png" alt="" width={140} height={140} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-310 px-6 max-sm:px-4">
        <nav
          aria-label="상황별 안내"
          className="-mt-8 grid gap-3 rounded-2xl border border-line bg-card p-3 shadow-card md:grid-cols-3"
        >
          {QUICK_LINKS.map(({ icon: Icon, ...item }) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3.5 rounded-xl p-4 transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white"
              >
                <Icon size={21} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold">{item.title}</span>
                <span className="block text-[12.5px] break-keep text-muted">{item.text}</span>
              </span>
              <ArrowUpRightIcon
                size={17}
                className="shrink-0 text-subtle transition-colors group-hover:text-brand"
              />
            </Link>
          ))}
        </nav>

        <section aria-labelledby="features-title" className="mt-20">
          <SectionHeading
            id="features-title"
            eyebrow="What we do"
            title="FindUs는 이렇게 도와요"
            description="흐려진 기억도 다시 단서가 될 수 있도록, 찾기와 제보를 쉽게 만듭니다."
          />
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, ...f }) => (
              <li key={f.title} className="rounded-2xl border border-line bg-card p-6 shadow-card">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Icon size={22} />
                </span>
                <p className="mt-4 text-[16.5px] font-bold">{f.title}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed break-keep text-muted">{f.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
