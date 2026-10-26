"use client";

import { useEffect, useState } from "react";
import type { MissingPerson } from "@/lib/types";
import HomeFeaturedChild from "./HomeFeaturedChild";
import Modal from "./Modal";
import styles from "./HomeFeaturedChild.module.css";

// 한 번 띄운 뒤에는 같은 창(탭)에서 다시 띄우지 않고, '오늘 하루 보지 않기'를 누르면 그날은 띄우지 않는다.
const SHOWN_KEY = "findus:featured-popup-shown";
const HIDE_UNTIL_KEY = "findus:featured-popup-hidden-until";
const OPEN_DELAY_MS = 900;
/** 로고를 누르면 보내는 신호. 홈에 있으면 바로 팝업을 다시 띄운다. */
export const SHOW_FEATURED_EVENT = "findus:show-featured";

/** 로고를 눌렀을 때 부른다. 다른 페이지에서 홈으로 갈 때도, 이미 홈에 있을 때도 팝업이 다시 뜨게 한다. */
export function requestFeaturedPopup() {
  try { window.sessionStorage.removeItem(SHOWN_KEY); } catch { /* 무시 */ }
  window.dispatchEvent(new Event(SHOW_FEATURED_EVENT));
}

const today = () => new Date().toLocaleDateString("sv-SE");

const hiddenToday = () => {
  try { return window.localStorage.getItem(HIDE_UNTIL_KEY) === today(); } catch { return false; }
};

function shouldOpen(): boolean {
  try {
    if (window.sessionStorage.getItem(SHOWN_KEY)) return false;
  } catch { /* 저장소를 못 쓰면 이번에만 보여준다. */ }
  return !hiddenToday();
}

/** 홈에 처음 들어왔을 때 한 아이를 팝업으로 소개한다. 히어로 화면을 가리지 않도록 카드 대신 팝업으로 띄운다. */
export default function HomeFeaturedPopup({ person }: { person: MissingPerson }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let timer = 0;
    const show = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setOpen(true);
        try { window.sessionStorage.setItem(SHOWN_KEY, "1"); } catch { /* 무시 */ }
      }, OPEN_DELAY_MS);
    };
    if (shouldOpen()) show();
    // 이미 홈에 있을 때 로고를 누르면 페이지가 새로 그려지지 않으므로 신호를 받아 다시 띄운다.
    const onRequest = () => { if (!hiddenToday()) show(); };
    window.addEventListener(SHOW_FEATURED_EVENT, onRequest);
    return () => { window.clearTimeout(timer); window.removeEventListener(SHOW_FEATURED_EVENT, onRequest); };
  }, []);

  if (!open) return null;

  const hideToday = () => {
    try { window.localStorage.setItem(HIDE_UNTIL_KEY, today()); } catch { /* 무시 */ }
    setOpen(false);
  };

  return (
    <Modal title="지금 함께 찾고 있는 아이" eyebrow="함께 찾아주세요" accent="coral" size="narrow" onClose={() => setOpen(false)}>
      <HomeFeaturedChild person={person} variant="popup" />
      <div className={styles.popupFoot}>
        <button type="button" onClick={hideToday}>오늘 하루 보지 않기</button>
        <button type="button" onClick={() => setOpen(false)}>닫기</button>
      </div>
    </Modal>
  );
}
