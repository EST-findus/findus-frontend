"use client";

import { Suspense, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./InfoPages.module.css";

export type PageTab = { key: string; label: string };
type PageTabsProps = { label: string; tabs: PageTab[]; panels: ReactNode[]; hashAliases?: Record<string, string> };

/**
 * 페이지 상단 탭. 선택한 탭은 `?tab=` 주소에 남겨 새로고침·공유해도 같은 탭이 열린다.
 * 첫 번째 탭이 기본이며, 기본 탭일 때는 `tab` 값을 주소에서 지운다.
 */
export default function PageTabs(props: PageTabsProps) {
  // 정적 페이지에서 useSearchParams를 쓰려면 Suspense가 필요하다. 주소를 읽기 전에는 첫 탭을 보여준다.
  return <Suspense fallback={<TabsView {...props} selected={0} onSelect={() => {}} />}><SyncedTabs {...props} /></Suspense>;
}

function SyncedTabs(props: PageTabsProps) {
  const { tabs, hashAliases } = props;
  const params = useSearchParams();
  const [hashKey, setHashKey] = useState<string | null>(null);

  useEffect(() => {
    setHashKey(hashAliases?.[window.location.hash] ?? null);
  }, [hashAliases]);

  const key = params.get("tab") ?? hashKey;
  const fromUrl = Math.max(0, tabs.findIndex((tab) => tab.key === key));
  const [selected, setSelected] = useState(fromUrl);

  // 같은 페이지에서 메뉴 링크(?tab=ai 등)로 주소만 바뀌어도 탭을 따라간다.
  useEffect(() => {
    setSelected(fromUrl);
  }, [fromUrl]);

  const select = (index: number) => {
    setSelected(index);
    setHashKey(null);
    const url = new URL(window.location.href);
    if (index === 0) url.searchParams.delete("tab");
    else url.searchParams.set("tab", tabs[index].key);
    url.hash = "";
    // Next 라우터 내부 state를 그대로 넘기면 주소 동기화가 무시되므로 null을 넘긴다.
    window.history.replaceState(null, "", url);
  };

  return <TabsView {...props} selected={selected} onSelect={select} />;
}

function TabsView({ label, tabs, panels, selected, onSelect }: PageTabsProps & { selected: number; onSelect: (index: number) => void }) {
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <>
      <div className={`page-container max-w-5xl ${styles.tabsWrap}`}>
        <div role="tablist" aria-label={label} className={styles.tabs} style={{ "--tab-count": tabs.length, "--tab-index": selected } as CSSProperties}>
          <span aria-hidden="true" className={styles.tabIndicator} />
          {tabs.map((tab, index) => (
            <button
              key={tab.key}
              ref={(element) => { buttons.current[index] = element; }}
              id={`${id}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={selected === index}
              aria-controls={`${id}-panel-${index}`}
              tabIndex={selected === index ? 0 : -1}
              onClick={() => onSelect(index)}
              onKeyDown={(event) => {
                if (event.ctrlKey || event.metaKey || event.altKey) return;
                const next = event.key === "ArrowRight" ? (index + 1) % tabs.length
                  : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length
                  : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
                if (next === null) return;
                event.preventDefault();
                onSelect(next);
                buttons.current[next]?.focus();
              }}
              className={styles.tab}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {panels.map((content, index) => (
        <div key={index} id={`${id}-panel-${index}`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} hidden={selected !== index} tabIndex={0} className={styles.panel}>
          {content}
        </div>
      ))}
    </>
  );
}
