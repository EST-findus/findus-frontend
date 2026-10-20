export type Gender = "남" | "여" | "미상";
export type SortKey = "recent" | "oldest" | "name";

export type GenderFilter = "all" | Gender;
export type PeriodKey = "all" | "before2000" | "2000s" | "2010s" | "after2020";
export type AgeGroupKey = "all" | "0-3" | "4-6" | "7-9" | "10+";

export interface SearchFilters {
  gender: GenderFilter;
  /** "all" 또는 시·도 약칭 (예: "서울") */
  region: string;
  period: PeriodKey;
  ageGroup: AgeGroupKey;
}

export interface StylePhoto {
  /** 스타일 탭 이름 (예: "안경") */
  label: string;
  src: string;
}

export interface MissingPerson {
  /** 관리번호 */
  id: string;
  source?: "api";
  sourceId?: string;
  images?: {id:string;url:string;sortOrder:number}[];
  clothing?: string;
  lastSyncedAt?: string;
  attribution?: string;
  name: string;
  gender: Gender;
  /** 만 나이 */
  ageAtMissing: number | null;
  /** 만 나이 */
  currentAge: number | null;
  /** ISO "YYYY-MM-DD" (정렬용). 화면에는 "YYYY. MM. DD." */
  missingDate: string;
  /** 시·도 약칭 (지역 필터용) */
  region: string;
  missingLocation: string;
  features: string;
  photos: {
    /** 실종 당시 원본 */
    past: string;
    /** AI 예상 모습 (현재 나이 기준) */
    aged: string;
    /** 스타일 변형 (첫 번째가 기본 선택) */
    styles: StylePhoto[];
  };
  /** 상세 모달 "AI 알고리즘 분석" 문구 */
  aiNote: string;
}
