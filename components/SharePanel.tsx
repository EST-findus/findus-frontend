"use client";

import { useEffect, useRef, useState } from "react";
import {
  personStoryImagePath,
  personUrl,
  qrFileName,
  shareText,
  shareTitle,
  storyFileName,
} from "@/lib/share";
import type { MissingPerson } from "@/lib/types";
import { CheckIcon, DownloadIcon, ImageIcon, LinkIcon, QrIcon, ShareIcon } from "./Icons";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const OPTION =
  `flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-card px-3 text-[14px] font-bold transition-colors hover:border-brand hover:text-brand disabled:cursor-wait disabled:opacity-60 ${FOCUS_RING}`;

const isAbort = (e: unknown) => e instanceof DOMException && e.name === "AbortError";

function downloadUrl(href: string, fileName: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = fileName;
  document.body.append(a);
  a.click();
  a.remove();
}

/** 상세정보의 "공유하기"를 누르면 열리는 옵션: 링크 복사 · QR 코드 · 스토리 이미지 · 다른 앱으로 공유 */
export default function SharePanel({ person, id }: { person: MissingPerson; id: string }) {
  // 패널은 클릭 후에만 마운트되므로 window를 바로 써도 된다.
  const url = personUrl(window.location.origin, person.id);
  const canNativeShare = typeof navigator.share === "function";

  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [storyBusy, setStoryBusy] = useState(false);
  const [status, setStatus] = useState("");
  const urlInputRef = useRef<HTMLInputElement>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // iOS Safari는 클릭 직후(사용자 동작 안)에만 공유 시트를 열 수 있어, 스토리 이미지를 미리 받아 둔다.
  const storyRef = useRef<Promise<File | null> | null>(null);
  const loadStory = () =>
    (storyRef.current ??= fetch(personStoryImagePath(person.id))
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => blob && new File([blob], storyFileName(person), { type: "image/png" }))
      .catch(() => null));
  useEffect(() => {
    void loadStory();
    // 사람마다 패널이 새로 마운트되므로 최초 1회만 받는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  useEffect(() => {
    if (copyFailed) urlInputRef.current?.select();
  }, [copyFailed]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setStatus("링크를 복사했어요. 원하는 곳에 붙여 넣어 공유해 주세요.");
      clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 권한이 없거나 http 환경이면 직접 복사할 수 있게 주소를 보여준다.
      setCopyFailed(true);
      setStatus("자동 복사가 되지 않아요. 아래 주소를 길게 눌러 복사해 주세요.");
    }
  };

  const toggleQr = async () => {
    const next = !qrOpen;
    setQrOpen(next);
    if (!next || qr) return;
    const QRCode = (await import("qrcode")).default;
    setQr(await QRCode.toDataURL(url, { width: 480, margin: 2, color: { dark: "#1c2420", light: "#ffffff" } }));
  };

  const shareStory = async () => {
    setStoryBusy(true);
    try {
      const file = await loadStory();
      if (!file) {
        storyRef.current = null; // 다음 클릭에서 다시 받는다
        setStatus("이미지를 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: shareTitle(person), text: shareText(person) });
          setStatus("");
          return;
        } catch (e) {
          if (isAbort(e)) return;
          // 사용자 동작이 만료된 경우(NotAllowedError) 등은 저장으로 대신한다.
        }
      }
      const href = URL.createObjectURL(file);
      downloadUrl(href, file.name);
      setTimeout(() => URL.revokeObjectURL(href), 1000);
      setStatus("스토리 이미지를 저장했어요. 인스타그램 스토리에서 불러와 올려 주세요.");
    } finally {
      setStoryBusy(false);
    }
  };

  const shareNative = async () => {
    try {
      await navigator.share({ title: shareTitle(person), text: shareText(person), url });
    } catch (e) {
      if (!isAbort(e)) setStatus("공유 창을 열지 못했어요. 링크 복사를 이용해 주세요.");
    }
  };

  return (
    <section id={id} aria-label="공유 방법" className="mt-3 rounded-xl bg-surface p-4 max-sm:p-3">
      <p className="mb-3 text-[13.5px] font-bold break-keep">
        더 많은 사람이 볼 수 있도록 알려 주세요
      </p>

      <div className={`grid gap-2 ${canNativeShare ? "grid-cols-2" : "grid-cols-3 max-sm:grid-cols-1"}`}>
        <button type="button" onClick={copyLink} className={OPTION}>
          {copied ? <CheckIcon size={17} strokeWidth={2.2} /> : <LinkIcon size={17} strokeWidth={2} />}
          {copied ? "복사됨" : "링크 복사"}
        </button>
        <button
          type="button"
          onClick={toggleQr}
          aria-expanded={qrOpen}
          aria-controls={`${id}-qr`}
          className={`${OPTION} ${qrOpen ? "border-brand! text-brand!" : ""}`}
        >
          <QrIcon size={17} strokeWidth={2} />
          QR 코드
        </button>
        <button type="button" onClick={shareStory} disabled={storyBusy} className={OPTION}>
          <ImageIcon size={17} strokeWidth={2} />
          {storyBusy ? "만드는 중…" : "스토리 이미지"}
        </button>
        {canNativeShare && (
          <button type="button" onClick={shareNative} className={OPTION}>
            <ShareIcon size={17} strokeWidth={2} />
            다른 앱으로
          </button>
        )}
      </div>

      {copyFailed && (
        <input
          ref={urlInputRef}
          readOnly
          value={url}
          aria-label="공유 링크"
          onFocus={(e) => e.currentTarget.select()}
          className={`mt-3 h-11 w-full rounded-lg border border-line bg-card px-3 text-[13.5px] ${FOCUS_RING}`}
        />
      )}

      {qrOpen && (
        <div id={`${id}-qr`} className="mt-3 flex items-center gap-4 rounded-lg bg-card p-4 max-sm:flex-col">
          <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-lg border border-line">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL이라 next/image 최적화 대상이 아니다
              <img src={qr} alt={`${person.name} 상세정보 QR 코드`} width={136} height={136} />
            ) : (
              <span className="text-[12.5px] text-subtle">만드는 중…</span>
            )}
          </div>
          <div className="min-w-0 text-[13.5px] break-keep text-muted max-sm:text-center">
            <p>휴대폰 카메라로 찍으면 이 아이의 상세정보로 바로 연결돼요. 전단지나 게시물에 넣어 활용해 주세요.</p>
            <button
              type="button"
              disabled={!qr}
              onClick={() => qr && downloadUrl(qr, qrFileName(person))}
              className={`mt-3 inline-flex h-10 items-center gap-1.5 rounded-lg bg-brand px-3.5 font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60 ${FOCUS_RING}`}
            >
              <DownloadIcon size={16} strokeWidth={2.2} />
              QR 이미지 저장
            </button>
          </div>
        </div>
      )}

      <p role="status" aria-live="polite" className="mt-3 text-[13px] font-semibold break-keep text-brand empty:mt-0">
        {status}
      </p>
      <p className="mt-2 text-[12px] break-keep text-subtle">
        공식 기관에 등록된 정보만 공유돼요. AI 예상 모습은 실제와 다를 수 있다는 점도 함께 알려 주세요.
      </p>
    </section>
  );
}
