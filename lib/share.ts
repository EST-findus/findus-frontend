import { formatDate, formatAge } from "./format";
import type { MissingPerson } from "./types";

// 상세정보 공유(링크·QR·스토리 이미지)에 쓰는 주소와 문구. 브라우저/서버 어디서든 쓸 수 있게 순수 함수로 둔다.

/** 관리번호에 영문·숫자·하이픈 외 문자가 섞여도 깨지지 않게 인코딩한다. */
export const personPath = (id: string) => `/missing/${encodeURIComponent(id)}`;

export const personStoryImagePath = (id: string) => `${personPath(id)}/story`;

export const personOgImagePath = (id: string) => `${personPath(id)}/og`;

export const personUrl = (origin: string, id: string) =>
  new URL(personPath(id), origin).toString();

/** "2001. 05. 20. 서울특별시 … 에서 실종 (당시 5세)" */
export const missingSummary = (person: MissingPerson) =>
  `${formatDate(person.missingDate)} ${person.missingLocation}에서 실종 (당시 ${formatAge(person.ageAtMissing)})`;

export const shareTitle = (person: MissingPerson) =>
  person.source === "api" ? `${person.name}${person.currentAge === null ? "" : ` (현재 ${formatAge(person.currentAge)})`}를 찾습니다` : `${person.name} (현재 추정 ${person.currentAge}세)를 찾습니다`;

/** 메신저·공유 시트에 링크와 함께 붙는 본문 */
export const shareText = (person: MissingPerson) =>
  `${shareTitle(person)}\n${missingSummary(person)}\n목격하셨다면 경찰청 182로 알려 주세요.`;

export const storyFileName = (person: MissingPerson) => `findus-${person.id}.png`;
export const qrFileName = (person: MissingPerson) => `findus-${person.id}-qr.png`;
