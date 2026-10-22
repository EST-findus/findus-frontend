export type ReunionStory = { kind: string; title: string; source: string; date: string; href: string; action: string };

/** 장기 실종 후 가족을 다시 만난 사례 기사. 정보 마당에 전체, 마이페이지에 요약을 보여준다. */
export const REUNION_NEWS: ReunionStory[] = [
  { kind: "뉴스", title: "52년 만에 다시 만난 모녀", source: "연합뉴스", date: "2024.09.12", href: "https://www.yna.co.kr/amp/view/AKR20240912073000052", action: "기사 보기" },
  { kind: "뉴스", title: "독일의 아들, 42년 만의 상봉", source: "외교부", date: "2023.03.16", href: "https://www.mofa.go.kr/www/brd/m_4080/view.do?page=1&pitem=102026&seq=373472", action: "보도자료 보기" },
  { kind: "뉴스 · 영상", title: "55년 만에 다시 만난 모녀", source: "YTN", date: "2024.12.20", href: "https://www.ytn.co.kr/_ln/0103_202412201005096761", action: "영상 보기" },
  { kind: "뉴스", title: "43년 만에 다시 만난 가족", source: "연합뉴스", date: "2023.03.13", href: "https://www.yna.co.kr/view/AKR20230313130500530", action: "기사 보기" },
  { kind: "뉴스 · 해외", title: "40년 만에 다시 만난 형제", source: "Missing People", date: "2025.09", href: "https://www.missingpeople.org.uk/september-2025-gettogether-good-news-stories", action: "소식 보기" },
];

/** 마이페이지 요약에 보여줄 개수 */
export const NEWS_SUMMARY_COUNT = 3;

/** 정보 마당의 뉴스 탭 주소 */
export const NEWS_PAGE_HREF = "/community?tab=news";
