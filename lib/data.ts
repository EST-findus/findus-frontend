import type { MissingPerson } from "./types";

// 데이터 접근은 이 파일에만 둔다. 백엔드(Spring Boot)가 준비되면 아래 함수 내부만 fetch로 교체한다.

// 가상 인물별로 어린 시절 → 성인 예상 → 동일 얼굴의 스타일 변형을 묶는다.
const photo = (id: string, variant: string) =>
  `/images/mock-persons/${id}/${variant}.jpg`;

const AI_NOTE =
  "AI로 만든 가상 인물 예시입니다. 실제 실종아동 사진·연령 예측 결과가 아닙니다.";

const MOCK_PERSONS: MissingPerson[] = [
  {
    id: "MC-2001-0812",
    name: "김민준",
    gender: "남",
    ageAtMissing: 5,
    currentAge: 30,
    missingDate: "2001-05-20",
    region: "서울",
    missingLocation: "서울특별시 종로구 혜화동 마로니에공원 인근",
    features:
      "둥근 얼굴형, 왼쪽 귀 윗부분에 작은 점, 마른 체격, 실종 당시 노란색 반팔 티셔츠와 파란 멜빵바지 착용",
    photos: {
      past: photo("MC-2001-0812", "past"),
      aged: photo("MC-2001-0812", "aged"),
      styles: [
        { label: "안경", src: photo("MC-2001-0812", "glasses") },
        { label: "헤어", src: photo("MC-2001-0812", "hair") },
      ],
    },
    aiNote: AI_NOTE,
  },
  {
    id: "MC-1999-0341",
    name: "이서연",
    gender: "여",
    ageAtMissing: 7,
    currentAge: 34,
    missingDate: "1999-11-14",
    region: "부산",
    missingLocation: "부산광역시 해운대구 우동 해운대시장 앞",
    features: "오른쪽 눈 밑 약 1cm 가량의 연한 흉터, 쌍꺼풀 없음, 긴 생머리, 턱이 갸름한 편",
    photos: {
      past: photo("MC-1999-0341", "past"),
      aged: photo("MC-1999-0341", "aged"),
      styles: [
        { label: "웨이브", src: photo("MC-1999-0341", "waves") },
        { label: "묶음머리", src: photo("MC-1999-0341", "ponytail") },
      ],
    },
    aiNote: AI_NOTE,
  },
  {
    id: "MC-2015-0104",
    name: "박준영",
    gender: "남",
    ageAtMissing: 9,
    currentAge: 20,
    missingDate: "2015-08-03",
    region: "경기",
    missingLocation: "경기도 수원시 팔달구 매산로1가 수원역 광장",
    features:
      "지적장애 2급, 걸음걸이가 다소 부자연스러움, 자주 고개를 갸우뚱거림, 실종 당시 검정 운동화 착용",
    photos: {
      past: photo("MC-2015-0104", "past"),
      aged: photo("MC-2015-0104", "aged"),
      styles: [
        { label: "단정", src: photo("MC-2015-0104", "neat") },
        { label: "수염", src: photo("MC-2015-0104", "beard") },
      ],
    },
    aiNote: AI_NOTE,
  },
  {
    id: "MC-1994-0627",
    name: "정우진",
    gender: "남",
    ageAtMissing: 4,
    currentAge: 36,
    missingDate: "1994-06-27",
    region: "대구",
    missingLocation: "대구광역시 중구 동성로 대구백화점 앞",
    features: "곱슬머리, 오른손 엄지에 작은 화상 흉터, 웃을 때 보조개, 실종 당시 빨간 티셔츠 착용",
    photos: {
      past: photo("MC-1994-0627", "past"),
      aged: photo("MC-1994-0627", "aged"),
      styles: [
        { label: "헤어", src: photo("MC-1994-0627", "hair") },
        { label: "수염", src: photo("MC-1994-0627", "beard") },
      ],
    },
    aiNote: AI_NOTE,
  },
  {
    id: "MC-2008-0915",
    name: "한지민",
    gender: "여",
    ageAtMissing: 3,
    currentAge: 21,
    missingDate: "2008-09-15",
    region: "인천",
    missingLocation: "인천광역시 남동구 구월동 인천종합터미널 인근",
    features: "곱슬기 있는 갈색 머리, 왼쪽 손목에 연한 반점, 실종 당시 노란 머리핀과 흰 원피스 착용",
    photos: {
      past: photo("MC-2008-0915", "past"),
      aged: photo("MC-2008-0915", "aged"),
      styles: [
        { label: "웨이브", src: photo("MC-2008-0915", "waves") },
        { label: "단발", src: photo("MC-2008-0915", "bob") },
      ],
    },
    aiNote: AI_NOTE,
  },
  {
    id: "MC-2004-0302",
    name: "오하은",
    gender: "여",
    ageAtMissing: 1,
    currentAge: 23,
    missingDate: "2004-03-02",
    region: "광주",
    missingLocation: "광주광역시 북구 중흥동 광주역 대합실",
    features: "큰 눈, 옅은 갈색 머리, 오른쪽 귀 뒤에 작은 점, 실종 당시 하늘색 유아복 착용",
    photos: {
      past: photo("MC-2004-0302", "past"),
      aged: photo("MC-2004-0302", "aged"),
      styles: [
        { label: "긴머리", src: photo("MC-2004-0302", "long-hair") },
        { label: "헤어", src: photo("MC-2004-0302", "half-up") },
      ],
    },
    aiNote: AI_NOTE,
  },
];

export async function getMissingPersons(): Promise<MissingPerson[]> {
  return MOCK_PERSONS;
}

export async function getMissingPersonById(id: string): Promise<MissingPerson | undefined> {
  return MOCK_PERSONS.find((p) => p.id === id);
}
