"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  missingSummary,
  personOgImagePath,
  personStoryImagePath,
  personUrl,
  qrFileName,
  shareText,
  shareTitle,
  storyFileName,
} from "@/lib/share";
import type { MissingPerson } from "@/lib/types";
import { CheckIcon, DownloadIcon, LinkIcon, ShareIcon } from "./Icons";
import Modal from "./Modal";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const PRIMARY = `flex h-12 flex-1 max-sm:flex-none items-center justify-center gap-2 rounded-xl bg-brand px-3.5 text-white transition-colors hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60 ${FOCUS_RING}`;
const SECONDARY = `flex h-12 flex-1 max-sm:flex-none items-center justify-center gap-2 rounded-xl border border-line bg-card px-3.5 transition-colors hover:border-brand hover:text-brand disabled:cursor-wait disabled:opacity-60 ${FOCUS_RING}`;

const TABS = [
  { key: "link", label: "링크" },
  { key: "story", label: "스토리 이미지" },
  { key: "qr", label: "QR 코드" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const isAbort = (e: unknown) => e instanceof DOMException && e.name === "AbortError";

function downloadUrl(href: string, fileName: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = fileName;
  document.body.append(a);
  a.click();
  a.remove();
}

interface ShareModalProps {
  person: MissingPerson;
  onClose: () => void;
  returnFocusTo?: HTMLElement | null;
}

/** 공유 방법(링크·스토리 이미지·QR)마다 실제로 공유될 화면을 미리 보여주고 공유한다. */
export default function ShareModal({ person, onClose, returnFocusTo }: ShareModalProps) {
  // 모달은 클릭 후에만 마운트되므로 window를 바로 써도 된다.
  const url = personUrl(window.location.origin, person.id);
  const canNativeShare = typeof navigator.share === "function";
  const baseId = useId();

  const [tab, setTab] = useState<TabKey>("link");
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [story, setStory] = useState<{ file: File; src: string } | null>(null);
  const [storyFailed, setStoryFailed] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [status, setStatus] = useState("");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 스토리 이미지는 미리보기와 공유에 같은 파일을 쓴다. iOS Safari는 클릭 직후에만 공유 시트를
  // 열 수 있어서, 누르기 전에 받아 두어야 한다.
  const [storyAttempt, setStoryAttempt] = useState(0);
  useEffect(() => {
    let src: string | null = null;
    let cancelled = false;
    setStoryFailed(false);
    fetch(personStoryImagePath(person.id))
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const file = new File([blob], storyFileName(person), { type: "image/png" });
        src = URL.createObjectURL(file);
        setStory({ file, src });
        setCanShareFiles(navigator.canShare?.({ files: [file] }) ?? false);
      })
      .catch(() => !cancelled && setStoryFailed(true));
    return () => {
      cancelled = true;
      if (src) URL.revokeObjectURL(src);
    };
  }, [person, storyAttempt]);

  useEffect(() => {
    let cancelled = false;
    import("qrcode")
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(url, { width: 480, margin: 2, color: { dark: "#1c2420", light: "#ffffff" } }),
      )
      .then((data) => !cancelled && setQr(data))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  const selectTab = (key: TabKey) => {
    setTab(key);
    setStatus("");
  };

  // 탭 관례: 화살표 키로 이동, Tab은 선택된 탭 하나만 거친다.
  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = TABS.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = index === last ? 0 : index + 1;
    if (e.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    if (next === null) return;
    e.preventDefault();
    selectTab(TABS[next].key);
    tabRefs.current[next]?.focus();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setStatus("링크를 복사했어요. 원하는 곳에 붙여 넣어 공유해 주세요.");
      clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 권한이 없거나 http 환경이면 직접 복사하도록 주소 칸을 선택해 둔다.
      document.getElementById(`${baseId}-url`)?.focus();
      setStatus("자동 복사가 되지 않아요. 주소 칸의 링크를 직접 복사해 주세요.");
    }
  };

  const shareLink = async () => {
    try {
      await navigator.share({ title: shareTitle(person), text: shareText(person), url });
    } catch (e) {
      if (!isAbort(e)) setStatus("공유 창을 열지 못했어요. 링크 복사를 이용해 주세요.");
    }
  };

  const saveStory = () => {
    if (!story) return;
    downloadUrl(story.src, story.file.name);
    setStatus("이미지를 저장했어요. 인스타그램 스토리에서 불러와 올려 주세요.");
  };

  const shareStory = async () => {
    if (!story) return;
    try {
      await navigator.share({ files: [story.file], title: shareTitle(person), text: shareText(person) });
    } catch (e) {
      // 사용자 동작이 만료된 경우(NotAllowedError) 등은 저장으로 대신한다.
      if (!isAbort(e)) saveStory();
    }
  };

  const panelId = (key: TabKey) => `${baseId}-${key}-panel`;
  const tabId = (key: TabKey) => `${baseId}-${key}-tab`;

  return (
    <Modal title={`${person.name} 정보 공유하기`} onClose={onClose} returnFocusTo={returnFocusTo}>
      <div role="tablist" aria-label="공유 방법" className="mb-4 flex gap-1 rounded-xl bg-surface p-1">
        {TABS.map((t, i) => {
          const selected = t.key === tab;
          return (
            <button
              key={t.key}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={tabId(t.key)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId(t.key)}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectTab(t.key)}
              onKeyDown={(e) => handleTabKeyDown(e, i)}
              className={`h-10 flex-1 rounded-lg text-[14px] font-bold transition-colors ${FOCUS_RING} ${
                selected ? "bg-card text-brand shadow-card" : "text-muted hover:text-brand"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={panelId(tab)}
        aria-labelledby={tabId(tab)}
        tabIndex={0}
        className={`rounded-xl outline-none ${FOCUS_RING}`}
      >
        <div className="flex min-h-90 flex-col items-center justify-center rounded-xl bg-surface p-5 max-sm:min-h-0 max-sm:p-3.5">
          {tab === "link" && (
            <>
              <p className="mb-3 text-[13px] font-semibold break-keep text-muted">
                카카오톡·문자로 링크를 보내면 이렇게 보여요
              </p>
              <div className="w-full max-w-90 overflow-hidden rounded-xl border border-line bg-card shadow-card">
                {/* eslint-disable-next-line @next/next/no-img-element -- 서버에서 그린 미리보기 이미지 그대로 보여준다 */}
                <img
                  src={personOgImagePath(person.id)}
                  alt={`${person.name} 링크 미리보기 이미지`}
                  width={1200}
                  height={630}
                  className="aspect-1200/630 w-full bg-surface object-cover"
                />
                <div className="px-3.5 py-3">
                  <p className="text-[14px] font-bold break-keep">{shareTitle(person)}</p>
                  <p className="mt-0.5 line-clamp-2 text-[12.5px] break-keep text-muted">
                    {missingSummary(person)}
                  </p>
                  <p className="mt-1.5 truncate text-[12px] text-subtle">{window.location.host}</p>
                </div>
              </div>
            </>
          )}

          {tab === "story" && (
            <>
              <p className="mb-3 text-[13px] font-semibold break-keep text-muted">
                인스타그램 스토리에 이렇게 올라가요
              </p>
              <div className="flex aspect-9/16 h-[min(52vh,420px)] items-center justify-center overflow-hidden rounded-xl border border-line bg-card shadow-card">
                {story ? (
                  // eslint-disable-next-line @next/next/no-img-element -- 공유할 파일(blob)을 그대로 미리 보여준다
                  <img src={story.src} alt={`${person.name} 스토리 공유 이미지`} className="h-full w-full object-cover" />
                ) : storyFailed ? (
                  <button
                    type="button"
                    onClick={() => setStoryAttempt((n) => n + 1)}
                    className={`px-4 text-[13px] font-semibold text-brand hover:underline ${FOCUS_RING}`}
                  >
                    이미지를 만들지 못했어요. 다시 시도
                  </button>
                ) : (
                  <span className="text-[13px] text-subtle">이미지 만드는 중…</span>
                )}
              </div>
            </>
          )}

          {tab === "qr" && (
            <>
              <p className="mb-3 text-[13px] font-semibold break-keep text-muted">
                휴대폰 카메라로 찍으면 상세정보로 바로 연결돼요
              </p>
              <div className="flex h-56 w-56 items-center justify-center rounded-xl border border-line bg-white p-3 shadow-card">
                {qr ? (
                  // eslint-disable-next-line @next/next/no-img-element -- data URL이라 next/image 최적화 대상이 아니다
                  <img src={qr} alt={`${person.name} 상세정보 QR 코드`} width={200} height={200} />
                ) : (
                  <span className="text-[13px] text-subtle">만드는 중…</span>
                )}
              </div>
              <p className="mt-3 text-[12.5px] break-keep text-subtle">전단지나 게시물에 넣어 활용해 주세요.</p>
            </>
          )}
        </div>

        {tab === "link" && (
          <input
            id={`${baseId}-url`}
            readOnly
            value={url}
            aria-label="공유 링크"
            onFocus={(e) => e.currentTarget.select()}
            className={`mt-4 h-11 w-full rounded-lg border border-line bg-card px-3 text-[13.5px] text-muted ${FOCUS_RING}`}
          />
        )}

        <div className="mt-4 flex gap-2.5 text-[14px] font-bold max-sm:flex-col">
          {tab === "link" && (
            <>
              <button type="button" onClick={copyLink} className={PRIMARY}>
                {copied ? <CheckIcon size={17} strokeWidth={2.2} /> : <LinkIcon size={17} strokeWidth={2} />}
                {copied ? "복사됨" : "링크 복사"}
              </button>
              {canNativeShare && (
                <button type="button" onClick={shareLink} className={SECONDARY}>
                  <ShareIcon size={17} strokeWidth={2} />
                  다른 앱으로 공유
                </button>
              )}
            </>
          )}
          {tab === "story" && (
            <>
              {canShareFiles && (
                <button type="button" onClick={shareStory} disabled={!story} className={PRIMARY}>
                  <ShareIcon size={17} strokeWidth={2} />
                  스토리에 공유
                </button>
              )}
              <button type="button" onClick={saveStory} disabled={!story} className={canShareFiles ? SECONDARY : PRIMARY}>
                <DownloadIcon size={17} strokeWidth={2.1} />
                이미지 저장
              </button>
            </>
          )}
          {tab === "qr" && (
            <button
              type="button"
              disabled={!qr}
              onClick={() => qr && downloadUrl(qr, qrFileName(person))}
              className={PRIMARY}
            >
              <DownloadIcon size={17} strokeWidth={2.1} />
              QR 이미지 저장
            </button>
          )}
        </div>
      </div>

      <p role="status" aria-live="polite" className="mt-3 text-[13px] font-semibold break-keep text-brand empty:mt-0">
        {status}
      </p>
      <p className="mt-2 text-[12px] break-keep text-subtle">
        공식 기관에 등록된 정보만 공유돼요. AI 예상 모습은 실제와 다를 수 있다는 점도 함께 알려 주세요.
      </p>
    </Modal>
  );
}
