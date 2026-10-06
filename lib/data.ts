import type { MissingPerson, TipPayload } from "./types";

// 데이터 접근은 이 파일에만 둔다. 백엔드(Spring Boot)가 준비되면 아래 함수 내부만 fetch로 교체한다.

const photo = (id: string) =>
  `https://images.unsplash.com/${id}?w=400&auto=format&fit=crop&q=80`;

const AI_NOTE =
  "부모 및 친족의 3D 얼굴 윤곽 데이터를 기반으로 성인기 하안면(턱·광대) 골격 발달 및 피부 노화 패턴을 반영하여 정밀 시뮬레이션하였습니다.";

const MOCK_PERSONS: MissingPerson[] = [
  {
    id: "MP-2001-0812",
    name: "김민준",
    gender: "남",
    category: "child",
    status: "실종 접수",
    ageAtMissing: 5,
    currentAge: 28,
    missingDate: "2001-05-20",
    missingLocation: "서울특별시 종로구 혜화동 마로니에공원 인근",
    features:
      "둥근 얼굴형, 왼쪽 귀 윗부분에 작은 점, 마른 체격, 실종 당시 노란색 반팔 티셔츠와 파란 멜빵바지 착용",
    photos: {
      past: photo("photo-1543332164-6e82f355badc"),
      ai: [
        { src: photo("photo-1507003211169-0a1dd7228f2d"), label: "AI 예상 28세 (기본)" },
        { src: photo("photo-1500648767791-00dcc994a43e"), label: "AI 예상 28세 (안경)" },
      ],
    },
    aiNote: AI_NOTE,
  },
  {
    id: "MP-1999-0341",
    name: "이서연",
    gender: "여",
    category: "child",
    status: "실종 접수",
    ageAtMissing: 7,
    currentAge: 32,
    missingDate: "1999-11-14",
    missingLocation: "부산광역시 해운대구 우동 해운대시장 앞",
    features: "오른쪽 눈 밑 약 1cm 가량의 연한 흉터, 쌍꺼풀 없음, 긴 생머리, 턱이 갸름한 편",
    photos: {
      past: photo("photo-1517486808906-6ca8b3f04846"),
      ai: [
        { src: photo("photo-1534528741775-53994a69daeb"), label: "AI 예상 32세 (기본)" },
        { src: photo("photo-1517841905240-472988babdf9"), label: "AI 예상 32세 (웨이브)" },
      ],
    },
    aiNote: AI_NOTE,
  },
  {
    id: "MP-2015-0104",
    name: "박준영",
    gender: "남",
    category: "disabled",
    status: "실종 접수",
    ageAtMissing: 16,
    currentAge: 25,
    missingDate: "2015-08-03",
    missingLocation: "경기도 수원시 팔달구 매산로1가 수원역 광장",
    features:
      "지적장애 2급, 걸음걸이가 다소 부자연스러움, 자주 고개를 갸우뚱거림, 실종 당시 검정 운동화 착용",
    photos: {
      past: photo("photo-1539571696357-5a69c17a67c6"),
      ai: [
        { src: photo("photo-1506794778202-cad84cf45f1d"), label: "AI 예상 25세 (기본)" },
        { src: photo("photo-1519085360753-af0119f7cbe7"), label: "AI 예상 25세 (성인형)" },
      ],
    },
    aiNote: AI_NOTE,
  },
  {
    id: "MP-2023-0491",
    name: "최순자",
    gender: "여",
    category: "senior",
    status: "긴급 수색",
    ageAtMissing: 78,
    currentAge: 80,
    missingDate: "2024-02-19",
    missingLocation: "대전광역시 서구 둔산동 은하수네거리 부근",
    features:
      "치매 앓음, 백발 파마머리, 굽은 허리, 자주 혼잣말을 하심, 분홍색 패딩 조끼 및 보행기 소지",
    photos: {
      past: photo("photo-1581579438747-1dc8d17bbce4"),
      ai: [
        { src: photo("photo-1544005313-94ddf0286df2"), label: "AI 복원 80세 (기본)" },
        { src: photo("photo-1508214751196-bcfd4ca60f91"), label: "AI 복원 80세 (모자착용)" },
      ],
    },
    aiNote: AI_NOTE,
  },
];

export async function getMissingPersons(): Promise<MissingPerson[]> {
  return MOCK_PERSONS;
}

/** 목업: 실제 전송 없이 resolve 한다. */
export async function submitTip(tip: TipPayload): Promise<void> {
  void tip;
}
