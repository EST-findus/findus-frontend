/**
 * AI 연구 안내의 작동 과정 시연 데이터.
 * 좌표는 예시 사진(543×724, 가상 인물 MC-2008-0915)에 맞춰 손으로 정한 시연용 값이며, 실제 검출 결과가 아니다.
 * 단계 설명과 수치는 docs/[09] AI최종모델.md 기준이다.
 */

export const DEMO_IMAGE = { width: 543, height: 724 };

const base = "/images/mock-persons/MC-2008-0915";
export const DEMO_PHOTOS = {
  past: `${base}/past.jpg`,
  aged: `${base}/aged.jpg`,
  styles: [
    { key: "aged", label: "기본", src: `${base}/aged.jpg` },
    { key: "waves", label: "웨이브", src: `${base}/waves.jpg` },
    { key: "bob", label: "단발", src: `${base}/bob.jpg` },
  ],
  ageFrom: 3,
  ageTo: 21,
};

type Point = readonly [number, number];

/** RetinaFace가 찾는 5점: 두 눈, 코끝, 입꼬리 둘 */
export const FIVE_POINTS: readonly Point[] = [[218, 318], [320, 313], [271, 368], [240, 418], [305, 416]];

/** 얼굴 상자 [x, y, w, h] */
export const FACE_BOX = [138, 196, 272, 300] as const;

/** 특징 읽기 단계에서 얼굴 위에 찍는 점 (윤곽·눈썹·눈·코·입) */
export const FEATURE_POINTS: readonly Point[] = [
  // 턱선
  [150, 322], [153, 360], [162, 396], [178, 430], [202, 458], [234, 478], [271, 485], [308, 477], [339, 457], [362, 428], [377, 394], [385, 358], [388, 320],
  // 눈썹
  [188, 292], [205, 284], [224, 283], [242, 288], [298, 285], [316, 280], [335, 281], [352, 288],
  // 눈
  [198, 318], [208, 311], [220, 310], [233, 316], [220, 324], [304, 313], [316, 307], [329, 308], [340, 314], [328, 321],
  // 코
  [270, 322], [270, 342], [271, 362], [254, 374], [271, 380], [288, 373],
  // 입
  [240, 418], [256, 409], [272, 411], [288, 408], [305, 416], [289, 428], [272, 431], [256, 428],
];

/** 점끼리 이을 선 (FEATURE_POINTS 인덱스 범위) */
export const FEATURE_LINES: readonly (readonly [number, number, boolean])[] = [
  [0, 12, false], // 턱선
  [13, 16, false], [17, 20, false], // 눈썹
  [21, 25, true], [26, 30, true], // 눈 (닫힌 선)
  [31, 33, false], [34, 36, false], // 코
  [37, 44, true], // 입
];

export type DemoStep = { key: string; title: string; model: string; text: string; detail?: string };

export const DEMO_STEPS: DemoStep[] = [
  {
    key: "detect",
    title: "얼굴 찾기",
    model: "RetinaFace",
    text: "사진에서 얼굴이 어디 있는지 찾고, 두 눈·코끝·입꼬리 다섯 점을 표시해요.",
  },
  {
    key: "align",
    title: "얼굴 바로 세우기",
    model: "FFHQ 정렬 · 1024px",
    text: "다섯 점을 기준으로 눈높이를 수평으로 맞추고, 얼굴을 1024×1024 크기로 잘라 내요.",
    detail: "흑백 사진이면 이 단계에서 색만 입혀요. 밝기와 얼굴 모양은 원본 그대로 둬요.",
  },
  {
    key: "encode",
    title: "얼굴을 숫자로 읽기",
    model: "SAM 인코더",
    text: "눈·코·입의 모양과 얼굴 윤곽을 18단계 × 512개의 숫자로 바꿔요. AI는 이 숫자를 고쳐서 얼굴을 바꿔요.",
  },
  {
    key: "age",
    title: "나이 바꾸기",
    model: "SAM + 자체 보정 모듈",
    text: "숫자를 목표 나이 쪽으로 옮겨 성장한 얼굴을 그려요. 그 사람다운 특징이 덜 사라지도록 직접 학습한 보정 모듈을 붙였어요.",
    detail: "성별이 뒤바뀌어 보이는 결과는 성별 보정으로 다시 맞춰요.",
  },
  {
    key: "hair",
    title: "머리 모양 바꾸기",
    model: "HairFastGAN + 얼굴 지키기",
    text: "나이 변환은 얼굴만 바꿔요. 그래서 자라면서 달라졌을 머리 모양을 여러 버전으로 보여줘요. 얼굴 부위는 원래 결과를 그대로 써요.",
  },
  {
    key: "result",
    title: "참고 이미지 완성",
    model: "AI 생성 표시",
    text: "결과는 실제 얼굴을 재현한 것이 아니라 AI가 새로 그린 참고 이미지예요. 그래서 항상 'AI 생성' 표시를 붙여요.",
  },
];

/** 검증 결과 (docs/[09] 5장·7장, test 77명) */
export const VERIFY_STATS = [
  { value: "77명", label: "학습에 쓰지 않은 사람으로 최종 확인", note: "설정을 고를 때 쓰지 않은 확인용 데이터로 한 번만 평가했어요." },
  { value: "79%", label: "원본 모델보다 실제 성인 얼굴에 가까워짐", note: "77명 중 61명. 얼굴인식 모델 ArcFace·AdaFace 두 개로 채점했어요." },
  { value: "37% → 24%", label: "성별이 뒤바뀌어 보이는 결과 감소", note: "성별 보정을 더해 결과가 평균 얼굴로 쏠리는 문제를 줄였어요." },
  { value: "0.94", label: "머리 모양을 바꿔도 얼굴 유지", note: "얼굴 지키기 합성 전 0.78 → 후 0.94 (같은 사람 점수, 1에 가까울수록 같음)." },
];
