// 펀딩 캠페인의 아이를 실종아동 DB에서 찾는다. 서버 컴포넌트에서만 쓴다.
// 사진은 DB에 저장된 경찰청 공개 사진만 쓰고, 백엔드가 꺼져 있으면 사진 없이 이름만 보여준다.

import { getMissingPersons } from "./data";
import type { Campaign } from "./funding";
import type { MissingPerson } from "./types";

/** 캠페인 id → 아이 정보. 찾지 못한 캠페인은 빠진다. */
export async function childrenOf(campaigns: Campaign[]): Promise<Record<string, MissingPerson>> {
  let persons: MissingPerson[];
  try {
    persons = await getMissingPersons();
  } catch {
    return {};
  }
  const bySourceId = new Map(persons.map((person) => [person.sourceId, person]));
  return Object.fromEntries(
    campaigns.flatMap((campaign) => {
      const person = bySourceId.get(campaign.child.sourceId);
      return person ? [[campaign.id, person]] : [];
    }),
  );
}
