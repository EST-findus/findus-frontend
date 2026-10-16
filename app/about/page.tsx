import type { Metadata } from "next";
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
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import ServiceInfoContent from "@/components/ServiceInfoContent";

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
    text: "제보 방법을 안내하고 경찰청 182·안전Dream으로 바로 이어집니다.",
  },
];

export default function AboutPage() {
  return (
    <main className="md:pb-12">
      <header className="hidden border-b border-line md:block">
        <div className="page-container max-w-5xl pt-8 pb-6">
          <p className="text-[13px] font-bold text-brand">서비스 소개</p>
          <h1 className="mt-2 text-[32px] leading-snug font-extrabold tracking-tight">기억을 잇고, 다시 만날 수 있도록.</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">시간이 흘러도, 기다림은 이어집니다. 작은 관심과 오래된 기억이 가족을 잇는 단서가 됩니다.</p>
          <Link href="/search" className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-[14px] font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
            실종아동 정보 찾아보기 <ArrowRightIcon size={16} strokeWidth={2.2} />
          </Link>
        </div>
      </header>

      <div className="md:hidden">
      <PageHero
        overlap
        eyebrow="장기 실종아동 찾기 지원 서비스"
        title={
          <>
            기억을 잇고,
            <br />
            다시 만날 수 있도록.
          </>
        }
        description={
          <>
            시간이 흘러도, 기다림은 이어집니다.
            <br />
            작은 관심과 오래된 기억이 가족을 잇는 단서가 됩니다.
          </>
        }

      >
        <Link
          href="/search"
          className="mt-8 inline-flex h-13 items-center gap-2 rounded-xl bg-brand px-6 text-[16px] font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          실종아동 정보 찾아보기 <ArrowRightIcon size={17} strokeWidth={2.2} />
        </Link>
      </PageHero>
      </div>

      <div className="page-container md:max-w-5xl">
        <nav
          aria-label="상황별 안내"
          className="relative -mt-14 grid gap-2 rounded-2xl border border-line bg-card p-3 shadow-panel md:mt-6 md:grid-cols-3 md:gap-3 md:border-0 md:p-0 md:shadow-none"
        >
          {QUICK_LINKS.map(({ icon: Icon, ...item }) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-4 rounded-xl p-4.5 transition-colors md:gap-3 md:border md:border-line md:p-4 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white"
              >
                <Icon size={21} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-bold">{item.title}</span>
                <span className="mt-0.5 block text-[13.5px] break-keep text-muted">{item.text}</span>
              </span>
              <ArrowUpRightIcon
                size={17}
                className="shrink-0 text-subtle transition-colors group-hover:text-brand"
              />
            </Link>
          ))}
        </nav>

        <section aria-labelledby="features-title" className="mt-24 rounded-3xl bg-gold-soft p-10 max-lg:p-8 max-sm:mt-16 max-sm:p-5 md:mt-10 md:rounded-2xl md:bg-gold-faint md:p-6 md:[&_h2]:text-[24px] md:[&_h2]:leading-snug md:[&_h2]:tracking-tight">
          <SectionHeading
            id="features-title"
            eyebrow="주요 기능"
            title="FindUs는 이렇게 도와요"
            description="흐려진 기억도 다시 단서가 될 수 있도록, 찾기와 제보를 쉽게 만듭니다."
          />
          <ul className="mt-10 grid gap-5 md:mt-6 md:grid-cols-3 md:gap-4 max-sm:mt-8">
            {FEATURES.map(({ icon: Icon, ...f }) => (
              <li key={f.title} className="rounded-2xl border border-line bg-card p-7 shadow-card md:p-5 md:shadow-none max-sm:p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Icon size={24} />
                </span>
                <p className="mt-5 text-[18px] font-bold">{f.title}</p>
                <p className="mt-2 text-[15px] leading-[1.65] break-keep text-muted">{f.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="service-info" aria-labelledby="service-info-title" className="mt-10 mb-8 rounded-2xl border border-line bg-white p-5 md:hidden">
          <h2 id="service-info-title" className="mb-3 text-[20px] font-bold">서비스 정보</h2>
          <ServiceInfoContent />
        </section>
      </div>
    </main>
  );
}
