// 펀딩 상세의 "이야기" 섹션 내용. 책자 「최준원, 기억을 잇다」(기록 기준 2026.10.20)를 펀딩 설득 흐름으로 줄였다.
// 가족·권리자 동의를 받아 싣는다는 전제이며, 다른 사례로 바꿀 때는 이 파일만 고친다.
// 사진은 public/images/funding/story/ 에 넣는다. 파일이 없으면 화면에 자리 표시가 나온다.

export interface StoryImage {
  src: string;
  alt: string;
  caption: string;
}

export interface StorySource {
  label: string;
  title: string;
  url: string;
}

export const STORY = {
  person: {
    name: "최준원",
    gender: "여성",
    birth: "1995. 06. 08.",
    missingDate: "2000. 04. 04.",
    ageAtMissing: "6세",
    place: "서울 중랑구 망우1동, 염광아파트 일대",
    body: "키 약 120cm, 체중 약 15kg",
    features: "쌍꺼풀 없는 눈, 아래로 처진 눈썹, 어금니의 은색 치료 흔적",
  },
  childPhoto: { src: "/images/funding/story/child.jpg", alt: "실종 당시 최준원님 사진", caption: "당시 사진 · 영화 《증발》 홍보물 발췌" },
  agedPhoto: { src: "/images/funding/story/aged.jpg", alt: "나이 든 모습을 추정해 만든 최준원님 이미지", caption: "성인 추정 이미지 · 영화 《증발》 홍보물 발췌" },
  day: {
    date: "2000년 4월 4일",
    weekday: "화요일",
    timeline: [
      { time: "오후 12시 30분경", text: "유치원에서 돌아온 뒤 친구가 있는 중국집에 놀러 간 것으로 보도됐습니다." },
      { time: "오후 3시 30분경", text: "친구 집에서 나온 것으로 파악됐다는 설명이 전해졌습니다." },
      { time: "오후 4시 30분경", text: "염광아파트 놀이터에서 보았다는 목격자 진술이 있습니다." },
      { time: "해 질 무렵", text: "언니를 만나러 가겠다는 말을 들었다는 회고가 있습니다." },
    ],
    note: "※ 시각은 당시의 객관적 영상기록이 아닌 보도·진술에 따른 대략적인 시간입니다. [SBS]",
  },
  sighting: {
    image: { src: "/images/funding/story/playground.jpg", alt: "염광아파트 놀이터가 있던 자리", caption: "장소 장면: 다큐멘터리 관련 영상에서 제공된 캡처 · 실종 당시 촬영 영상이 아님" } satisfies StoryImage,
    text: "염광아파트 놀이터 주변에서 준원님을 보았다는 목격자 진술이 보도됐습니다. 이후 실제 이동 경로는 확인되지 않았습니다.",
    caution: "보도 속 인물들이 준원님과 실제로 관련됐는지는 확인되지 않았습니다. 기억을 되살리는 면담이나 몽타주만으로 범죄 관련성을 추정할 수 없습니다.",
    source: "SBS 《그것이 알고 싶다》 1343회 및 후속 보도(2023)",
  },
  waiting: [
    { year: "2002", title: "전단을 나눠주며", text: "가족들은 전단을 나눠주며 준원님을 찾아왔습니다. 제보 내용과 전화 시각을 수첩에 기록했다는 이야기도 전해졌습니다.", image: { src: "/images/funding/story/family.jpg", alt: "실종아동 찾기 활동 중인 가족", caption: "실종아동 찾기 활동 장면 · 제공된 보도/행사 사진" } },
    { year: "2020", title: "다큐멘터리 《증발》", text: "가족과 장기실종 수사의 과정을 기록했습니다. 같은 해 장기실종 전담 수사관이 여러 권의 바인더에 담긴 과거 기록을 다시 살폈습니다.", image: { src: "/images/funding/story/documentary.jpg", alt: "영화 《증발》 행사 사진", caption: "영화 《증발》 행사에서 제공된 사진" } },
    { year: "2023", title: "사건을 다시 보다", text: "SBS는 당시 목격자들의 기억을 다시 살펴보고 실종 당일의 상황을 재구성했습니다. 방송에 나온 진술은 추가 검증이 필요한 자료입니다.", image: { src: "/images/funding/story/broadcast.jpg", alt: "SBS 그것이 알고 싶다 예고 영상 캡처", caption: "SBS 《그것이 알고 싶다》 관련 방송 예고 영상 캡처" } },
  ] satisfies { year: string; title: string; text: string; image: StoryImage }[],
  sources: [
    { label: "경찰청 안전Dream", title: "공식 실종정보", url: "https://www.safe182.go.kr" },
    { label: "동아일보", title: "초기 실종 보도 (2001)", url: "https://www.donga.com" },
    { label: "MBC", title: "가족의 기록 (2002)", url: "https://imnews.imbc.com" },
    { label: "경향신문", title: "재수사 기록 취재 (2020)", url: "https://www.khan.co.kr" },
    { label: "SBS 뉴스", title: "그것이 알고 싶다 (2023)", url: "https://news.sbs.co.kr" },
    { label: "KIST", title: "나이 변환 연구 (2023)", url: "https://vig.kist.re.kr" },
  ] satisfies StorySource[],
};

/** 스토리에 쓰는 모든 사진 경로 (있는지 확인할 때 쓴다) */
export const STORY_IMAGE_PATHS = [
  STORY.childPhoto.src,
  STORY.agedPhoto.src,
  STORY.sighting.image.src,
  ...STORY.waiting.map((item) => item.image.src),
];
