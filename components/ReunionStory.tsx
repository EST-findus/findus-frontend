"use client";

import { useState } from "react";
import Modal from "./Modal";
import styles from "./ReunionStory.module.css";
import { ArrowUpRightIcon, ChevronRightIcon, HeartIcon } from "./Icons";

type Story = { kind: string; title: string; source: string; date: string; href: string; action: string };

const NEWS: Story[] = [
  { kind: "뉴스", title: "52년 만에 다시 만난 모녀", source: "연합뉴스", date: "2024.09.12", href: "https://www.yna.co.kr/amp/view/AKR20240912073000052", action: "기사 보기" },
  { kind: "뉴스", title: "독일의 아들, 42년 만의 상봉", source: "외교부", date: "2023.03.16", href: "https://www.mofa.go.kr/www/brd/m_4080/view.do?page=1&pitem=102026&seq=373472", action: "보도자료 보기" },
  { kind: "뉴스 · 영상", title: "55년 만에 다시 만난 모녀", source: "YTN", date: "2024.12.20", href: "https://www.ytn.co.kr/_ln/0103_202412201005096761", action: "영상 보기" },
  { kind: "뉴스", title: "43년 만에 다시 만난 가족", source: "연합뉴스", date: "2023.03.13", href: "https://www.yna.co.kr/view/AKR20230313130500530", action: "기사 보기" },
  { kind: "뉴스 · 해외", title: "40년 만에 다시 만난 형제", source: "Missing People", date: "2025.09", href: "https://www.missingpeople.org.uk/september-2025-gettogether-good-news-stories", action: "소식 보기" },
];

const CAMPAIGNS: Story[] = [
  { kind: "캠페인 사례 · 2024", title: "사진으로 기억하는 실종아동네컷", source: "HSAD", date: "2024년 진행", href: "https://blog.hsad.co.kr/m/3589", action: "캠페인 사례 보기" },
  { kind: "캠페인 사례 · 2020", title: "얼굴을 알리는 호프테이프", source: "코리아타임스", date: "2020년 진행", href: "https://www.koreatimes.co.kr/video/news/20200605/hope-tape-how-a-simple-tape-can-help-find-missing-children-video", action: "캠페인 영상 보기" },
];

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function ReunionStory() {
  const [selected, setSelected] = useState<"news" | "campaigns" | null>(null);
  const items = selected === "campaigns" ? CAMPAIGNS : NEWS;

  return (
    <>
      <aside data-reunion-panel aria-labelledby="reunion-story-title" className="mt-4 rounded-2xl border border-line bg-[#f7faf8] max-md:mt-3">
        <div className="grid grid-cols-2 divide-x divide-gold/20">
          {([{ key: "news", label: "다시 만난 가족", items: NEWS }, { key: "campaigns", label: "희망을 잇는 손길", items: CAMPAIGNS }] as const).map((group) => (
            <section key={group.key} aria-label={group.label} className="min-w-0 px-4 pt-3.5 pb-0.5 max-sm:px-2.5 max-sm:pt-2 max-sm:pb-0">
              <div className="mb-1 flex items-center justify-between gap-1">
                <div className="flex min-w-0 items-center gap-1.5 max-sm:gap-0.5">
                  <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] leading-4 font-semibold max-sm:px-1 max-sm:text-[9px] ${group.key === "news" ? "border-brand/10 bg-brand-soft text-brand" : "border-gold/20 bg-gold-soft text-gold-ink"}`}>{group.key === "news" ? "뉴스" : "캠페인"}</span>
                  <h3 title={group.label} className="min-w-0 truncate text-[15px] font-bold text-brand max-sm:text-[14px]">{group.label}</h3>
                </div>
                {group.items.length > 3 && <button type="button" aria-label={`${group.label} 더보기`} aria-haspopup="dialog" onClick={() => setSelected(group.key)} className={`inline-flex shrink-0 items-center gap-0.5 rounded px-1 text-[13px] text-muted hover:text-brand max-sm:text-[12px] ${FOCUS}`}><span className="max-sm:sr-only">더보기</span><ChevronRightIcon size={12} /></button>}
              </div>
              <ul>
                {group.items.slice(0, 3).map((item) => <li key={item.href}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" title={`${item.title} · ${item.source} · ${item.date}`}
                    aria-label={`${item.kind}, ${item.title}, ${item.source}, ${item.date}, ${item.action} (새 창)`}
                    className={`${styles.link} flex min-w-0 items-center gap-1.5 rounded py-0.5 text-[14px] leading-5 max-sm:py-0.5 max-sm:text-[13px] ${FOCUS}`}>
                    <ArrowUpRightIcon size={15} className={`${styles.arrow} shrink-0 text-brand/70`} />
                    <span className={`${styles.title} truncate`}>{item.title}</span>
                  </a>
                </li>)}
              </ul>
            </section>
          ))}
        </div>
        <h2 id="reunion-story-title" className="flex items-center justify-end gap-2 text-right px-4 pt-1 pb-2 text-[14px] font-semibold text-gold-ink max-sm:px-3 max-sm:pt-1 max-sm:text-[13px]"><HeartIcon size={16} className="shrink-0 text-gold" />다시 만날 날을 바라며, 희망을 함께 이어가요.</h2>
      </aside>
      {selected && <Modal title={selected === "news" ? "다시 만난 가족들의 이야기" : "희망을 잇는 손길"} onClose={() => setSelected(null)}>
        <p className="mb-3 text-[12px] text-muted">{selected === "news" ? "제목을 누르면 기사·영상 원문이 새 창에서 열립니다." : "과거에 진행된 캠페인 사례입니다. 제목을 누르면 소개 자료가 새 창에서 열립니다."}</p>
        <ul className="divide-y divide-line">
          {items.map((item) => <li key={item.href}>
            <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`${item.title}, ${item.action} (새 창)`}
              className={`${styles.link} flex items-center justify-between gap-3 rounded-lg px-1 py-3 ${FOCUS}`}>
              <span><span className="block text-[11px] text-muted">{item.kind} · {item.source} · {item.date}</span><span className={`${styles.title} mt-1 block text-[14px] font-bold`}>{item.title}</span></span>
              <ArrowUpRightIcon size={17} className={`${styles.arrow} shrink-0 text-brand`} />
            </a>
          </li>)}
        </ul>
      </Modal>}
    </>
  );
}
