"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useAuthReady, useCurrentUser } from "@/lib/useCurrentUser";
import { formatPostDate, getPosts, type Post } from "@/lib/community";
import type { MissingPerson } from "@/lib/types";
import AccountSettings from "./AccountSettings";
import FamilyBadge from "./FamilyBadge";
import { useFamilyRecord } from "@/lib/useFamily";
import { chip, tab as tabButton, tabIndicator, tabs } from "./infoStyles";
import FavoriteChildren from "./FavoriteChildren";
import ReunionStory from "./ReunionStory";
import MyPledges from "./funding/MyPledges";
import { ArrowRightIcon, HeartIcon, MessageIcon } from "./Icons";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand";
const PAGE_TABS = [
  { key: "favorites", label: "관심 아동" },
  { key: "activity", label: "내 활동" },
  { key: "funding", label: "내 후원" },
  { key: "account", label: "계정" },
] as const;
type PageTab = (typeof PAGE_TABS)[number]["key"];

// 마이페이지 본문. 관심 아동 카드(FavoriteChildren → MobilePersonDetail → InfoRows) 안쪽은 data-* 속성으로 골라
// 크기·여백을 이 화면에 맞춘다. 낮은 화면에서는 큰 글자를 두고 바깥 여백을 줄인다.
const LAYOUT = [
  "tracking-normal",
  // 바깥 여백: 기본(넓고 높은 화면) → 좁은 화면 → 낮은 화면 순으로 덮어쓴다.
  // max-[600px]은 max-sm보다 앞에 정렬되므로 max-sm:와 겹쳐 써서 뒤에 오게 한다.
  "pt-3 pb-2 max-md:pt-12 max-md:pb-3 max-sm:pt-9 max-sm:pb-1 max-sm:max-[600px]:pt-7 max-sm:max-[600px]:pb-0",
  "md:[@media(max-height:760px)]:pt-1 md:[@media(max-height:760px)]:pb-0 min-[600px]:max-md:[@media(max-height:740px)]:pt-8 min-[600px]:max-md:[@media(max-height:740px)]:pb-1",
  "md:[&_[data-mock-label]]:hidden",
  "md:[&_[data-favorite-grid]]:mt-2 md:[@media(max-height:760px)]:[&_[data-favorite-grid]]:mt-1.5 md:[@media(max-height:760px)]:[&_[data-favorite-grid]]:mb-0",
  // 관심 아동 카드와 빈 상태: 흰 카드, 연한 파란 테두리, 올리면 가볍게 뜬다.
  "[&_[data-favorite-card]]:rounded-[20px] [&_[data-favorite-card]]:border-civic-line! [&_[data-favorite-card]]:bg-white [&_[data-favorite-card]]:shadow-[0_2px_10px_rgb(23_59_112/5%)] [&_[data-favorite-card]]:[transition:box-shadow_.35s_ease,border-color_.25s_ease]",
  "[&_[data-favorite-card]:hover]:border-civic-hover! [&_[data-favorite-card]:hover]:shadow-[0_14px_32px_rgb(23_59_112/9%)]",
  "md:[&_[data-favorite-card]]:w-full md:[&_[data-favorite-card]]:max-w-[900px] md:[&_[data-favorite-card]]:justify-self-center md:[&_[data-favorite-card]]:px-4 md:[&_[data-favorite-card]]:py-2.5",
  "[&_[data-favorite-empty]]:rounded-[20px] [&_[data-favorite-empty]]:border-dashed! [&_[data-favorite-empty]]:border-[#D4E1F0]! [&_[data-favorite-empty]]:bg-civic-panel [&_[data-favorite-empty]]:shadow-[0_2px_10px_rgb(23_59_112/5%)] [&_[data-favorite-empty]]:[transition:box-shadow_.35s_ease,border-color_.25s_ease]",
  "[&_[data-favorite-empty-icon]]:animate-mypage-beat-icon motion-reduce:[&_[data-favorite-empty-icon]]:animate-none!",
  // 아이 이름을 아래 비교 패널과 같은 줄에 맞춘다.
  "[&_[data-favorite-card]>header_h3]:text-[22px] max-md:[&_[data-favorite-card]>header_h3]:text-[20px] md:[&_[data-favorite-card]>header_h3]:text-left [&_[data-favorite-card]>header_button]:text-[13px]",
  "md:[&_[data-favorite-card]>header]:mx-auto md:[&_[data-favorite-card]>header]:grid md:[&_[data-favorite-card]>header]:w-full md:[&_[data-favorite-card]>header]:max-w-[800px] md:[&_[data-favorite-card]>header]:grid-cols-[300px_minmax(0,1fr)] md:[&_[data-favorite-card]>header]:gap-8 md:[&_[data-favorite-card]>header>div]:justify-self-end",
  // 제보·공유 버튼 줄
  "md:[&_[data-embedded-actions]]:mt-2 md:[&_[data-embedded-actions]]:pt-2 max-md:[&_[data-embedded-actions]]:mt-1.5 max-sm:max-[600px]:[&_[data-embedded-actions]]:mt-1",
  "md:[&_[data-favorite-card]>div>[data-embedded-actions]_button]:py-[9px] md:[@media(max-height:760px)]:[&_[data-embedded-actions]_button]:h-10",
  // 사진·AI 스타일·정보가 있는 카드 본문
  "md:[&_[data-embedded-body]]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:[&_[data-embedded-body]]:gap-6 md:[&_[data-embedded-body]]:pt-2 md:[@media(max-height:760px)]:[&_[data-embedded-body]]:pt-1.5",
  "[&_[data-embedded-body]_dl]:gap-y-[5px] [&_[data-embedded-body]_dl]:text-[14px] [&_[data-embedded-body]_dl]:leading-[1.45] max-md:[&_[data-embedded-body]_dl]:gap-y-1 max-md:[&_[data-embedded-body]_dl]:text-[13px]",
  "[&_[data-embedded-body]_dl>div]:gap-x-3 [&_[data-embedded-body]_dl>div>dt]:w-[60px] [&_[data-embedded-body]_dl>div>dt]:text-[13px] [&_[data-embedded-body]_dl>div>dt]:leading-[inherit] max-md:[&_[data-embedded-body]_dl>div>dt]:text-[12px]",
  "[&_[data-embedded-photo]_figcaption]:text-[13px] max-md:[&_[data-embedded-photo]_figcaption]:text-[12px] [&_[data-embedded-style]_button]:text-[13px] [&_[data-embedded-style]>div>span]:text-[13px] [&_[data-embedded-note]]:text-[12px] [&_[data-embedded-note]]:leading-[1.5]",
  "md:[&_[data-embedded-photo]]:max-w-[clamp(88px,calc(30dvh_-_120px),144px)] md:[@media(max-height:760px)]:[&_[data-embedded-photo]]:max-w-[88px] min-[600px]:max-md:[@media(max-height:740px)]:[&_[data-embedded-photo]]:max-w-[88px] max-[600px]:[&_[data-embedded-photo]]:max-w-[clamp(72px,calc(60dvh_-_400px),88px)]",
  // 경찰청 자료로 받은 아동(api): 사진 묶음 옆(좁으면 아래)에 정보 카드
  "[&_[data-favorite-api-body]]:mx-auto [&_[data-favorite-api-body]]:w-full [&_[data-favorite-api-body]]:max-w-[840px] [&_[data-favorite-api-body]]:items-center max-md:[&_[data-favorite-api-body]]:gap-5 max-md:[&_[data-favorite-api-body]]:pt-3 max-md:[&_[data-favorite-api-body]]:pb-1",
  "min-[600px]:max-md:[&_[data-favorite-api-body]]:grid-cols-[minmax(0,1fr)] min-[600px]:max-md:[&_[data-favorite-api-body]]:gap-4 md:[&_[data-favorite-api-body]]:max-w-[800px] md:[&_[data-favorite-api-body]]:grid-cols-[300px_minmax(0,1fr)] md:[&_[data-favorite-api-body]]:gap-8 md:[&_[data-favorite-api-body]]:pt-2.5 md:[&_[data-favorite-api-body]]:pb-0",
  "max-[600px]:[&_[data-favorite-api-body]>section]:w-full max-[600px]:[&_[data-favorite-api-body]>section]:max-w-[320px] max-[600px]:[&_[data-favorite-api-body]>section]:justify-self-center min-[600px]:max-md:[&_[data-favorite-api-body]>section]:w-full min-[600px]:max-md:[&_[data-favorite-api-body]>section]:max-w-[340px] min-[600px]:max-md:[&_[data-favorite-api-body]>section]:justify-self-center",
  // 정보 카드: 나이는 하늘빛 띠에, 한 줄에 하나씩, 출처·동기화 시각은 아래에 조용히. 줄이 차례로 들어온다.
  "[&_[data-favorite-api-body]>dl]:grid [&_[data-favorite-api-body]>dl]:gap-0 [&_[data-favorite-api-body]>dl]:overflow-hidden [&_[data-favorite-api-body]>dl]:rounded-2xl [&_[data-favorite-api-body]>dl]:border [&_[data-favorite-api-body]>dl]:border-civic-line [&_[data-favorite-api-body]>dl]:bg-white [&_[data-favorite-api-body]>dl]:p-0 [&_[data-favorite-api-body]>dl]:text-[16px] [&_[data-favorite-api-body]>dl]:leading-[1.5] [&_[data-favorite-api-body]>dl]:shadow-[0_2px_8px_rgb(23_59_112/4%)] max-md:[&_[data-favorite-api-body]>dl]:text-[15px]",
  "[&_[data-favorite-api-body]>dl_dd]:min-w-0 [&_[data-favorite-api-body]>dl_dd]:wrap-anywhere",
  "[&_[data-favorite-api-body]>dl>div]:grid [&_[data-favorite-api-body]>dl>div]:grid-cols-[96px_minmax(0,1fr)] [&_[data-favorite-api-body]>dl>div]:items-baseline [&_[data-favorite-api-body]>dl>div]:gap-3 [&_[data-favorite-api-body]>dl>div]:border-t [&_[data-favorite-api-body]>dl>div]:border-[#EEF2F7] [&_[data-favorite-api-body]>dl>div]:px-[18px] [&_[data-favorite-api-body]>dl>div]:py-[11px] [&_[data-favorite-api-body]>dl>div]:animate-mypage-row [&_[data-favorite-api-body]>dl>div]:[transition:background-color_.2s_ease]",
  "max-[600px]:[&_[data-favorite-api-body]>dl>div]:grid-cols-[80px_minmax(0,1fr)] max-[600px]:[&_[data-favorite-api-body]>dl>div]:gap-2.5 max-[600px]:[&_[data-favorite-api-body]>dl>div]:px-3.5 max-[600px]:[&_[data-favorite-api-body]>dl>div]:py-2.5",
  "motion-reduce:[&_[data-favorite-api-body]>dl>div]:animate-none motion-reduce:[&_[data-favorite-api-body]>dl>div]:transition-none",
  // 첫 줄(나이)과 아래 두 줄(출처·동기화)은 바탕색을 지키므로 올렸을 때 색이 바뀌는 건 가운데 줄뿐이다.
  "[&_[data-favorite-api-body]>dl>div:nth-child(n+2):nth-child(-n+7):hover]:bg-[#F7FAFE]",
  "[&_[data-favorite-api-body]>dl>div>dt]:relative [&_[data-favorite-api-body]>dl>div>dt]:w-auto [&_[data-favorite-api-body]>dl>div>dt]:pl-3 [&_[data-favorite-api-body]>dl>div>dt]:text-[13px] [&_[data-favorite-api-body]>dl>div>dt]:leading-[1.6] [&_[data-favorite-api-body]>dl>div>dt]:font-semibold [&_[data-favorite-api-body]>dl>div>dt]:text-civic-sub",
  "[&_[data-favorite-api-body]>dl>div>dt]:before:absolute [&_[data-favorite-api-body]>dl>div>dt]:before:top-[.62em] [&_[data-favorite-api-body]>dl>div>dt]:before:left-0 [&_[data-favorite-api-body]>dl>div>dt]:before:size-[5px] [&_[data-favorite-api-body]>dl>div>dt]:before:rounded-full [&_[data-favorite-api-body]>dl>div>dt]:before:bg-[#BFD3EC] [&_[data-favorite-api-body]>dl>div>dt]:before:content-['']",
  "[&_[data-favorite-api-body]>dl>div>dd]:text-[15px] [&_[data-favorite-api-body]>dl>div>dd]:leading-[1.6] [&_[data-favorite-api-body]>dl>div>dd]:font-semibold [&_[data-favorite-api-body]>dl>div>dd]:text-navy max-[600px]:[&_[data-favorite-api-body]>dl>div>dd]:text-[14px]",
  "[&_[data-favorite-api-body]>dl>div:first-child]:border-t-0 [&_[data-favorite-api-body]>dl>div:first-child]:bg-civic-soft [&_[data-favorite-api-body]>dl>div:first-child]:py-3.5 [&_[data-favorite-api-body]>dl>div:first-child>dt]:before:bg-coral",
  "[&_[data-favorite-api-body]>dl>div:first-child>dd_span]:text-[17px] [&_[data-favorite-api-body]>dl>div:first-child>dd_span]:font-extrabold [&_[data-favorite-api-body]>dl>div:first-child>dd_span]:tracking-[-.2px] [&_[data-favorite-api-body]>dl>div:first-child>dd_span]:text-civic",
  "[&_[data-favorite-api-body]>dl>div:nth-child(5)>dd]:font-medium [&_[data-favorite-api-body]>dl>div:nth-child(5)>dd]:break-keep [&_[data-favorite-api-body]>dl>div:nth-child(5)>dd]:wrap-anywhere [&_[data-favorite-api-body]>dl>div:nth-child(7)>dd]:font-medium [&_[data-favorite-api-body]>dl>div:nth-child(7)>dd]:break-keep [&_[data-favorite-api-body]>dl>div:nth-child(7)>dd]:wrap-anywhere",
  "[&_[data-favorite-api-body]>dl>div:nth-child(n+8)]:bg-civic-panel [&_[data-favorite-api-body]>dl>div:nth-child(n+8)]:py-2 [&_[data-favorite-api-body]>dl>div:nth-child(n+8)>dt]:before:bg-[#DCE5F0]",
  "[&_[data-favorite-api-body]>dl>div:nth-child(n+8)>dt]:text-[12.5px] [&_[data-favorite-api-body]>dl>div:nth-child(n+8)>dt]:font-medium [&_[data-favorite-api-body]>dl>div:nth-child(n+8)>dt]:text-civic-faint [&_[data-favorite-api-body]>dl>div:nth-child(n+8)>dd]:text-[12.5px] [&_[data-favorite-api-body]>dl>div:nth-child(n+8)>dd]:font-medium [&_[data-favorite-api-body]>dl>div:nth-child(n+8)>dd]:text-civic-faint",
  "[&_[data-favorite-api-body]>dl>div:nth-child(2)]:[animation-delay:.04s] [&_[data-favorite-api-body]>dl>div:nth-child(3)]:[animation-delay:.08s] [&_[data-favorite-api-body]>dl>div:nth-child(4)]:[animation-delay:.12s] [&_[data-favorite-api-body]>dl>div:nth-child(5)]:[animation-delay:.16s] [&_[data-favorite-api-body]>dl>div:nth-child(6)]:[animation-delay:.2s] [&_[data-favorite-api-body]>dl>div:nth-child(7)]:[animation-delay:.24s] [&_[data-favorite-api-body]>dl>div:nth-child(n+8)]:[animation-delay:.28s]",
].join(" ");

// 인사 머리말: 다른 페이지 히어로와 같은 연한 하늘빛 면. 줄마다 차례로 떠오르고, 오른쪽 하트가 천천히 떠다닌다.
const HELLO =
  "relative mb-3.5 overflow-hidden rounded-[20px] border border-[#DCE8F4] bg-[radial-gradient(circle_at_92%_18%,rgb(242_139_130/14%),transparent_38%),#EAF2F9] px-[30px] pt-6 pb-[26px] max-sm:rounded-2xl max-sm:px-[18px] max-sm:pt-5 max-sm:pb-[22px] [&>:not(:last-child)]:animate-mypage-hello [&>:nth-child(2)]:[animation-delay:.08s] [&>:nth-child(3)]:[animation-delay:.16s] [&>:nth-child(4)]:[animation-delay:.22s] motion-reduce:[&>*]:animate-none!";
const HELLO_MARK =
  "absolute top-1/2 right-[30px] -mt-[30px] grid size-[60px] animate-mypage-float place-items-center rounded-[18px] bg-white text-coral shadow-[0_12px_28px_rgb(23_59_112/10%)] max-sm:top-5 max-sm:right-4 max-sm:mt-0 max-sm:size-[46px] max-sm:rounded-[14px] [&_svg]:animate-mypage-beat motion-reduce:[&_svg]:animate-none!";
const CONTINUATION_LINK =
  "inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-[9px] font-bold text-coral-ink shadow-[inset_0_0_0_1px_#F6CDC9] [transition:background-color_.2s_ease,translate_.25s_cubic-bezier(.2,.7,.2,1)] hover:[translate:2px_0] hover:bg-[#FDE8E6] motion-reduce:transition-none motion-reduce:hover:[translate:none]";
// 탭 패널: 열릴 때 패널이 흐려졌다 나타나고 안의 카드가 차례로 떠오른다. 모든 탭의 카드가 같은 흰 면을 쓴다.
const PANEL = [
  "[&:not([hidden])]:animate-info-fade [&:not([hidden])>:first-child]:animate-mypage-panel [&:not([hidden])>*+*]:animate-mypage-panel-next motion-reduce:animate-none! motion-reduce:[&>*]:animate-none!",
  "[&_section[class*=rounded-3xl]]:rounded-[20px] [&_section[class*=rounded-3xl]]:border-civic-line! [&_section[class*=rounded-3xl]]:bg-white [&_section[class*=rounded-3xl]]:shadow-[0_2px_10px_rgb(23_59_112/5%)] [&_section[class*=rounded-3xl]]:[transition:box-shadow_.35s_ease,border-color_.25s_ease]",
  "[&_section[class*=rounded-3xl]:hover]:border-civic-hover! [&_section[class*=rounded-3xl]:hover]:shadow-[0_14px_32px_rgb(23_59_112/9%)]",
  "[&_li[class*=rounded-2xl]]:border-civic-line [&_li[class*=rounded-2xl]]:shadow-[0_2px_8px_rgb(23_59_112/4%)] [&_li[class*=rounded-2xl]]:[transition:translate_.35s_cubic-bezier(.2,.7,.2,1),box-shadow_.35s_ease]",
  "[&_li[class*=rounded-2xl]:hover]:[translate:0_-3px] [&_li[class*=rounded-2xl]:hover]:shadow-[0_14px_30px_rgb(23_59_112/9%)]",
  "motion-reduce:[&_li]:transition-none motion-reduce:[&_section]:transition-none motion-reduce:[&_li[class*=rounded-2xl]:hover]:[translate:none]",
].join(" ");
const CARD =
  "rounded-[20px] border-civic-line! bg-white shadow-[0_2px_10px_rgb(23_59_112/5%)] [transition:box-shadow_.35s_ease,border-color_.25s_ease] hover:border-civic-hover! hover:shadow-[0_14px_32px_rgb(23_59_112/9%)]";
const PILL_LINK =
  "inline-flex items-center gap-1 rounded-full border border-civic px-3.5 py-2 text-[14px] font-bold text-civic [transition:background-color_.2s_ease,color_.2s_ease] hover:bg-civic hover:text-white motion-reduce:transition-none";
// 빈 상태 첫 줄 위의 말풍선 아이콘
const EMPTY_ICON =
  "before:mx-auto before:mb-3.5 before:block before:size-11 before:rounded-full before:bg-civic-soft before:bg-[url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2722%27%20height=%2722%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%233978B8%27%20stroke-width=%271.8%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3E%3Cpath%20d=%27M21%2015a2%202%200%200%201-2%202H7l-4%204V5a2%202%200%200%201%202-2h14a2%202%200%200%201%202%202z%27/%3E%3C/svg%3E)] before:bg-[length:22px] before:bg-center before:bg-no-repeat before:content-['']";
const ACTIVITY_LIST =
  "[&>li]:animate-mypage-item [&>li:nth-child(2)]:[animation-delay:.05s] [&>li:nth-child(3)]:[animation-delay:.1s] [&>li:nth-child(4)]:[animation-delay:.15s] [&>li:nth-child(5)]:[animation-delay:.2s] motion-reduce:[&>li]:animate-none!";
const ACTIVITY_LINK =
  "px-2.5 [transition:background-color_.2s_ease,translate_.3s_cubic-bezier(.2,.7,.2,1)] hover:[translate:3px_0] hover:bg-[#F7FAFE] motion-reduce:transition-none motion-reduce:hover:[translate:none]";

export default function MyPage({ continuation, persons, initialTab }: { continuation: string | null; persons: MissingPerson[]; initialTab?: string }) {
  const user = useCurrentUser();
  const ready = useAuthReady();
  const router = useRouter();
  const [activity, setActivity] = useState<{ userId: string; posts: Post[] } | null>(null);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<"posts" | "comments">("posts");
  const userId = user?.id;
  const family = useFamilyRecord(userId);
  const [pageTab, setPageTab] = useState<PageTab>(() => PAGE_TABS.find((item) => item.key === initialTab)?.key ?? "favorites");
  const tabId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const moveTab = (event: React.KeyboardEvent, index: number) => {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % PAGE_TABS.length;
    else if (event.key === "ArrowLeft") next = (index + PAGE_TABS.length - 1) % PAGE_TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = PAGE_TABS.length - 1;
    else return;
    event.preventDefault();
    setPageTab(PAGE_TABS[next].key);
    tabRefs.current[next]?.focus();
  };

  useEffect(() => {
    if (ready && !user) router.replace("/");
  }, [ready, user, router]);

  // 헤더 계정 메뉴의 '내 활동'·'내 후원'처럼 마이페이지에 있는 동안 ?tab=만 바뀌어도 그 탭을 연다.
  useEffect(() => {
    const next = PAGE_TABS.find((item) => item.key === initialTab)?.key;
    if (next) setPageTab(next);
  }, [initialTab]);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const refresh = () => {
      getPosts().then((posts) => {
        if (active) { setActivity({ userId, posts }); setFailed(false); }
      }).catch(() => { if (active) setFailed(true); });
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [userId]);

  if (!ready || !user) {
    return <p role="status" className="page-container py-24 text-center text-muted">첫 화면을 준비하고 있어요.</p>;
  }

  const loaded = activity?.userId === user.id;
  const posts = loaded ? activity.posts : [];
  const myPosts = posts.filter((post) => post.authorId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const myComments = posts.flatMap((post) => post.comments.filter((comment) => comment.authorId === user.id).map((comment) => ({ ...comment, postId: post.id, postTitle: post.title }))).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const count = tab === "posts" ? myPosts.length : myComments.length;

  return (
    <>
      <div className={`${LAYOUT} page-container max-w-5xl`}>
        {/* 인사 머리말: 다른 페이지 히어로와 같은 연한 하늘빛 면에, 닉네임과 가족 확인 배지를 함께 둔다. */}
        <header className={HELLO}>
          <p className="inline-flex items-center gap-2 rounded-full border border-civic/16 bg-white/80 px-3 py-[5px] text-[12px] font-bold tracking-[.02em] text-civic"><span aria-hidden="true" className="size-1.5 animate-info-dot rounded-full bg-coral motion-reduce:animate-none!" />마이페이지</p>
          <h1 className="mt-3 text-[24px] leading-[1.4] font-extrabold tracking-[-.6px] break-keep text-navy max-sm:pr-14 max-sm:text-[20px]"><strong className="font-[850] text-civic">{user.nickname}</strong>님, 함께 기억해 주셔서 고마워요.</h1>
          <p className="mt-1 text-[14px] leading-[1.7] break-keep text-civic-muted max-sm:text-[13px]">관심 아동과 내 활동, 후원 내역을 한곳에서 확인하세요.</p>
          {family?.status === "verified" && <div className="mt-3"><FamilyBadge label="가족 확인됨" /></div>}
          <span aria-hidden="true" className={HELLO_MARK}><HeartIcon size={26} strokeWidth={1.8} /></span>
        </header>

        {continuation && (
          <aside className="mb-3.5 flex animate-mypage-rise flex-wrap items-center justify-between gap-4 rounded-[18px] border border-coral-line bg-coral-faint px-[22px] py-[18px] max-sm:p-4 motion-reduce:animate-none!">
            <div><p className="font-bold">로그인 전에 보던 화면이 있어요.</p><p className="mt-1 text-[14px] text-muted">마이페이지에서 확인한 뒤 하던 일을 이어갈 수 있어요.</p></div>
            <Link href={continuation} className={`${CONTINUATION_LINK} ${FOCUS}`}>이어서 진행하기 <ArrowRightIcon size={18} /></Link>
          </aside>
        )}

        <div data-mypage-toolbar className="mb-4 animate-mypage-rise md:mb-2 md:[@media(max-height:760px)]:mb-1.5 motion-reduce:animate-none!">
        <div role="tablist" aria-label="마이페이지 메뉴" className={tabs} style={{ "--tab-count": PAGE_TABS.length, "--tab-index": PAGE_TABS.findIndex((item) => item.key === pageTab) } as CSSProperties}>
          <span aria-hidden="true" className={tabIndicator} />
          {PAGE_TABS.map(({ key, label }, index) => (
            <button
              key={key} ref={(el) => { tabRefs.current[index] = el; }} type="button" role="tab"
              id={`${tabId}-tab-${key}`} aria-controls={`${tabId}-panel-${key}`}
              aria-selected={pageTab === key} tabIndex={pageTab === key ? 0 : -1}
              onClick={() => setPageTab(key)} onKeyDown={(event) => moveTab(event, index)}
              className={`${tabButton} text-[14px] max-md:text-[13px]`}
            >{label}</button>
          ))}
        </div>
        </div>

        <div role="tabpanel" id={`${tabId}-panel-favorites`} aria-labelledby={`${tabId}-tab-favorites`} hidden={pageTab !== "favorites"} tabIndex={0} className={`rounded-lg ${PANEL} ${FOCUS}`}>
          <FavoriteChildren key={user.id} userId={user.id} persons={persons} />
          <ReunionStory />
        </div>

        <div role="tabpanel" id={`${tabId}-panel-activity`} aria-labelledby={`${tabId}-tab-activity`} hidden={pageTab !== "activity"} tabIndex={0} className={`rounded-lg ${PANEL} ${FOCUS}`}>
          <section aria-labelledby="mypage-activity" className={`min-w-0 p-8 max-sm:p-5 ${CARD}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="mypage-activity" className="flex items-center gap-2 text-[23px] font-extrabold"><MessageIcon className="text-brand" />내 정보 마당 활동</h2>
              <Link href="/community/write" className={`${PILL_LINK} ${FOCUS}`}>글쓰기 <ArrowRightIcon size={15} /></Link>
            </div>
            <div role="group" aria-label="내 활동 분류" className="mt-6 flex gap-2 border-b border-line pb-4">
              {(["posts", "comments"] as const).map((key) => <button key={key} type="button" aria-pressed={tab === key} onClick={() => setTab(key)} className={`${chip} ${FOCUS}`}>{key === "posts" ? "내가 쓴 글" : "내가 쓴 댓글"} <span className="ml-1">{loaded ? (key === "posts" ? myPosts.length : myComments.length) : "—"}</span></button>)}
            </div>
            <div aria-live="polite">
              {failed ? <p role="alert" className="py-10 text-center text-muted">활동을 불러오지 못했어요. 새로고침 후 다시 확인해 주세요.</p> : !loaded ? <p role="status" className="py-10 text-center text-muted">내 활동을 불러오고 있어요.</p> : count === 0 ? (
                <div className="py-12 text-center">
                  <p className={`font-bold ${EMPTY_ICON}`}>아직 작성한 {tab === "posts" ? "글이" : "댓글이"} 없어요.</p>
                  <p className="mt-2 text-[14px] text-muted">나누고 싶은 정보나 응원의 마음을 남겨 보세요.</p>
                  <Link href="/community" className={`mt-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[14px] font-bold text-brand hover:bg-brand-soft ${FOCUS}`}>정보 마당 둘러보기 <ArrowRightIcon size={16} /></Link>
                </div>
              ) : (
                <>
                  <p className="mt-4 text-[12px] text-muted">최근 활동 {Math.min(count, 5)}개를 보여드려요.</p>
                  <ul className={`mt-2 divide-y divide-line ${ACTIVITY_LIST}`}>
                    {tab === "posts" ? myPosts.slice(0, 5).map((post) => <li key={post.id}><Link href={`/community/${post.id}`} className={`block rounded-lg py-4 hover:text-brand ${ACTIVITY_LINK} ${FOCUS}`}><p className="truncate font-bold">{post.title}</p><p className="mt-2 text-[12px] text-muted">{formatPostDate(post.createdAt)} · 댓글 {post.comments.length}개</p></Link></li>) : myComments.slice(0, 5).map((comment) => <li key={comment.id}><Link href={`/community/${comment.postId}`} className={`block rounded-lg py-4 hover:text-brand ${ACTIVITY_LINK} ${FOCUS}`}><p className="line-clamp-2 text-[14px] leading-relaxed">{comment.content}</p><p className="mt-2 truncate text-[12px] text-muted">{comment.postTitle} · {formatPostDate(comment.createdAt)}</p></Link></li>)}
                  </ul>
                </>
              )}
            </div>
          </section>

        </div>

        <div role="tabpanel" id={`${tabId}-panel-funding`} aria-labelledby={`${tabId}-tab-funding`} hidden={pageTab !== "funding"} tabIndex={0} className={`rounded-lg ${PANEL} ${FOCUS}`}>
          <MyPledges userId={user.id} />
        </div>

        <div role="tabpanel" id={`${tabId}-panel-account`} aria-labelledby={`${tabId}-tab-account`} hidden={pageTab !== "account"} tabIndex={0} className={`rounded-lg ${PANEL} ${FOCUS}`}>
          <AccountSettings user={user} />
        </div>

      </div>
    </>
  );
}
