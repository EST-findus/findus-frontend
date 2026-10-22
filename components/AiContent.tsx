import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  SparklesIcon,
} from "@/components/Icons";
import PageHero from "@/components/PageHero";
import AiPrinciplesPanel from "@/components/AiPrinciplesPanel";
import { getMissingPersons } from "@/lib/demoData";



/** 히어로 비주얼에 쓰는 예시 인물 */
const SAMPLE_ID = "MC-2008-0915";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default async function AiContent({ embedded = false }: { embedded?: boolean }) {
  const persons = await getMissingPersons();
  const sample = persons.find((p) => p.id === SAMPLE_ID) ?? persons[0];

  return (
    <>
      <PageHero
        embedded={embedded}
        eyebrow="책임 있는 AI"
        title={
          <>
            시간의 변화를 돕는 AI,
            <br />
            <span className="text-brand">신중하게</span> 연구합니다.
          </>
        }
        description="어린 시절 사진과 시간이 흐른 지금의 모습 사이를 AI가 잇습니다. 다만 AI의 추정은 단서일 뿐 정답이 아니기에, 분명한 원칙 안에서만 사용합니다."
        aside={
          <figure className="w-full max-w-130 justify-self-end rounded-3xl border border-line bg-card p-6 shadow-card-hover max-lg:justify-self-stretch max-lg:max-w-none max-sm:p-4">
                <figcaption className="mb-5 flex items-center justify-between">
                  <span className="text-[11.5px] font-bold tracking-[1.5px] text-muted uppercase">
                    AI 연령 변환
                  </span>
                  <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-[11.5px] font-bold text-gold-ink">
                    연구 단계
                  </span>
                </figcaption>

                <div className="relative grid grid-cols-2 gap-4 max-sm:gap-3">
                  <div>
                    <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-surface">
                      <Image
                        src={sample.photos.past}
                        alt={`${sample.name} 실종 당시 사진 (예시)`}
                        fill
                        sizes="(min-width: 1024px) 240px, 45vw"
                        className="object-cover"
                        priority
                      />
                    </div>
                    <p className="mt-2.5 text-[13.5px] font-bold">실종 당시 원본</p>
                    <p className="text-[12px] text-muted">
                      만 {sample.ageAtMissing}세 · {sample.missingDate.slice(0, 4)}년
                    </p>
                  </div>
                  <div>
                    <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-surface ring-2 ring-brand/30">
                      <Image
                        src={sample.photos.aged}
                        alt={`${sample.name} AI 예상 현재 모습 (예시)`}
                        fill
                        sizes="(min-width: 1024px) 240px, 45vw"
                        className="object-cover"
                        priority
                      />
                    </div>
                    <p className="mt-2.5 text-[13.5px] font-bold text-brand">AI 예상 모습</p>
                    <p className="text-[12px] text-muted">추정 {sample.currentAge}세 · 현재 기준</p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="absolute top-[38%] left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-card bg-brand text-white shadow-card-hover"
                  >
                    <SparklesIcon size={18} />
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-surface p-3">
                  <div className="flex -space-x-2">
                    {sample.photos.styles.map((s) => (
                      <span
                        key={s.label}
                        className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-card"
                      >
                        <Image src={s.src} alt="" fill sizes="36px" className="object-cover" />
                      </span>
                    ))}
                  </div>
                  <p className="text-[12.5px] break-keep text-muted">
                    <span className="font-bold text-ink">스타일 변형 {sample.photos.styles.length}종</span>{" "}
                    · {sample.photos.styles.map((s) => s.label).join(", ")}
                  </p>
                </div>
                <p className="mt-3 text-center text-[11.5px] text-subtle">
                  예시 이미지입니다. AI 예상 모습은 실제와 다를 수 있습니다.
                </p>
              </figure>
        }
      >
        <div className="mt-8 flex flex-wrap gap-2.5">
          <Link
            href="/search"
            className={`inline-flex h-13 items-center gap-2 rounded-xl bg-brand px-6 text-[16px] font-bold text-white transition-colors hover:bg-brand-dark ${FOCUS_RING}`}
          >
            실종아동 찾아보기 <ArrowRightIcon size={17} />
          </Link>
          <a
            href="#process"
            className={`inline-flex h-13 items-center rounded-xl border border-line bg-card px-6 text-[16px] font-bold transition-colors hover:border-brand hover:text-brand ${FOCUS_RING}`}
          >
            작동 방식 보기
          </a>
        </div>
      </PageHero>

      <div className={`page-container ${embedded ? "max-w-5xl" : ""} ${embedded ? "mt-8 max-sm:mt-6" : "mt-24 max-sm:mt-16"}`}>
        <AiPrinciplesPanel />

        {/* CTA */}
        <section className="relative mt-28 overflow-hidden rounded-3xl bg-brand px-12 py-12 text-white max-md:px-8 max-sm:mt-20 max-sm:px-6 max-sm:py-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-10 h-60 w-60 rounded-full bg-white/10 blur-2xl"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-[24px] leading-snug font-extrabold tracking-[-0.01em] break-keep max-sm:text-[19px]">
                실종 당시 사진과 AI 예상 모습을 직접 비교해 보세요.
              </p>
              <p className="mt-2 text-[15px] break-keep text-white/75">
                스타일 탭으로 안경·헤어 등 여러 모습을 바꿔 볼 수 있어요.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex h-13 items-center gap-2 rounded-xl bg-card px-6 text-[16px] font-bold text-brand transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              실종아동 찾아보기 <ArrowRightIcon size={17} />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
