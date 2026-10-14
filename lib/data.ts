import type { MissingPerson } from "./types";

// 데이터 접근은 이 파일에만 둔다. 백엔드(Spring Boot)가 준비되면 아래 함수 내부만 fetch로 교체한다.

/** crop: 얼굴이 가운데가 아닌 사진의 imgix 크롭 파라미터 */
const photo = (id: string, crop = "") =>
  `https://images.unsplash.com/${id}?w=400&h=533&auto=format&fit=crop&q=80${crop}`;

const AI_NOTE =
  "실종 당시 사진의 얼굴 비율을 기준으로 성장기 골격 발달(턱·광대)과 피부 변화 패턴을 반영해 현재 나이의 모습을 추정하였습니다. 실제 모습과 다를 수 있으니 참고용으로만 활용해 주세요.";

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
      past: photo("photo-1596870230751-ebdfce98ec42"),
      aged: photo("photo-1507003211169-0a1dd7228f2d"),
      styles: [
        { label: "안경", src: photo("photo-1599566150163-29194dcaad36") },
        { label: "헤어", src: photo("photo-1500648767791-00dcc994a43e") },
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
      past: photo(
        "photo-1476703993599-0035a21b17a9",
        "&crop=focalpoint&fp-x=0.38&fp-y=0.42&fp-z=1.8",
      ),
      aged: photo("photo-1534528741775-53994a69daeb"),
      styles: [
        { label: "웨이브", src: photo("photo-1517841905240-472988babdf9") },
        { label: "묶음머리", src: photo("photo-1488426862026-3ee34a7d66df") },
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
      past: photo(
        "photo-1588072432836-e10032774350",
        "&crop=focalpoint&fp-x=0.72&fp-y=0.4&fp-z=1.6",
      ),
      aged: photo("photo-1506794778202-cad84cf45f1d"),
      styles: [
        { label: "단정", src: photo("photo-1519085360753-af0119f7cbe7") },
        { label: "수염", src: photo("photo-1527082395-e939b847da0d") },
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
      past: photo("photo-1471286174890-9c112ffca5b4"),
      aged: photo("photo-1472099645785-5658abf4ff4e"),
      styles: [
        { label: "헤어", src: photo("photo-1570295999919-56ceb5ecca61") },
        { label: "수염", src: photo("photo-1552058544-f2b08422138a") },
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
      past: photo("photo-1503454537195-1dcabb73ffb9"),
      aged: photo("photo-1494790108377-be9c29b29330"),
      styles: [
        { label: "웨이브", src: photo("photo-1438761681033-6461ffad8d80") },
        { label: "단발", src: photo("photo-1580489944761-15a19d654956") },
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
      past: photo("photo-1491013516836-7db643ee125a"),
      aged: photo("photo-1531123897727-8f129e1688ce"),
      styles: [
        { label: "긴머리", src: photo("photo-1544005313-94ddf0286df2") },
        { label: "헤어", src: photo("photo-1607746882042-944635dfe10e") },
      ],
    },
    aiNote: AI_NOTE,
  },
];

export async function getMissingPersons(): Promise<MissingPerson[]> {
  return MOCK_PERSONS;
}
