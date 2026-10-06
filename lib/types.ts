export type Category = "child" | "senior" | "disabled";
export type FilterKey = "all" | Category | "longterm";
export type SortKey = "recent" | "longterm" | "name";

export interface AiPhoto {
  src: string;
  /** 사진 하단 라벨 */
  label: string;
}

export interface MissingPerson {
  /** 관리번호 */
  id: string;
  name: string;
  gender: "남" | "여";
  category: Category;
  /** "실종 접수" | "긴급 수색" 등 */
  status: string;
  /** 만 나이 */
  ageAtMissing: number;
  /** 만 나이 */
  currentAge: number;
  /** ISO "YYYY-MM-DD" (정렬용). 화면에는 "YYYY년 MM월 DD일" */
  missingDate: string;
  missingLocation: string;
  features: string;
  photos: {
    past: string;
    ai: [AiPhoto, AiPhoto];
  };
  /** 상세 모달 "AI 알고리즘 분석" 문구 */
  aiNote: string;
}

export interface TipPayload {
  personId: string;
  sighting: string;
  details: string;
  contact?: string;
}
