import Image from "next/image";

type InfoHeroProps = {
  eyebrow: string;
  title: string;
  /** 제목 둘째 줄, 브랜드 블루로 강조 */
  accent: string;
  description: React.ReactNode;
  image: string;
  /** 사진 속 인물이 글 쪽에 있으면 좌우를 뒤집어 오른쪽으로 보낸다 */
  flip?: boolean;
  imagePosition?: string;
};

// 사진은 오른쪽에만 은은하게 깔고(왼쪽으로 갈수록 마스크로 사라진다) 글은 왼쪽에 둔다.
const VISUAL =
  "pointer-events-none absolute inset-[0_0_0_34%] [mask-image:linear-gradient(90deg,transparent_0%,#000_46%)] max-sm:inset-0 max-sm:[mask-image:linear-gradient(90deg,transparent_0%,#000_75%)] [&_img]:object-cover [&_img]:opacity-62 [&_img]:[filter:saturate(.82)] [&_img]:animate-info-zoom max-sm:[&_img]:opacity-40 motion-reduce:[&_img]:animate-none!";
// 글 묶음의 각 줄이 차례로 떠오른다.
const COPY =
  "relative max-w-[560px] px-10 pt-[34px] pb-[38px] max-sm:px-5 max-sm:pt-6 max-sm:pb-[30px] [&>*]:animate-info-hero [&>:nth-child(2)]:[animation-delay:.08s] [&>:nth-child(3)]:[animation-delay:.16s] motion-reduce:[&>*]:animate-none!";

/** 정보 마당·이용 안내의 첫 화면. /search 캠페인 카드와 같은 톤으로, 사진은 오른쪽에 은은하게 깐다. */
export default function InfoHero({ eyebrow, title, accent, description, image, flip = false, imagePosition = "center" }: InfoHeroProps) {
  return (
    <header className="page-container max-w-5xl pt-4 max-sm:pt-2.5">
      <section className="relative min-h-[252px] overflow-hidden rounded-[18px] bg-[linear-gradient(180deg,#F4F8FD_0%,#FFFFFF_100%)] max-sm:min-h-[230px] max-sm:rounded-[14px]" aria-labelledby="info-hero-title">
        <div aria-hidden="true" className={`${VISUAL} ${flip ? "[&_img]:[transform:scaleX(-1)]" : ""}`}>
          <Image src={image} alt="" fill priority sizes="(min-width: 1024px) 680px, 100vw" style={{ objectPosition: imagePosition }} />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(244,248,253,0)_0%,rgba(244,248,253,.3)_70%,rgba(255,255,255,.72)_100%)]" />
        <div className={COPY}>
          <p className="inline-flex items-center gap-2 rounded-full border border-civic/14 bg-white/75 px-3 py-[5px] text-[12px] font-bold tracking-[.02em] text-civic">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-coral animate-info-dot motion-reduce:animate-none!" />{eyebrow}
          </p>
          <h1 id="info-hero-title" className="mt-3.5 text-[38px] leading-[1.24] font-[850] tracking-[-1.4px] break-keep text-navy max-sm:text-[28px] max-sm:tracking-[-1px]">{title}<br /><span className="text-civic">{accent}</span></h1>
          <p className="mt-3 text-[15px] leading-[1.75] break-keep text-civic-muted max-sm:max-w-[260px] max-sm:text-[13px]">{description}</p>
        </div>
        <span className="absolute right-4 bottom-2.5 text-[10px] tracking-[.01em] text-[#8A99AC] max-sm:right-3 max-sm:bottom-2 max-sm:text-[9px]">AI로 제작한 캠페인 이미지</span>
      </section>
    </header>
  );
}
