import { fetchMissingPersons, fetchMissingPerson, fetchMissingAiImage, withAiImage } from './missingApi';
import * as demo from './demoData';

/** 백엔드가 꺼져 있거나 응답이 이상하면 목업 데이터로 화면을 채운다. */
async function orDemo<T>(live: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try { return await live(); }
  catch (error) { console.warn('[목업] 백엔드 조회 실패, 목업 데이터로 표시합니다.', error); return fallback(); }
}

export const getMissingPersons = () => orDemo(fetchMissingPersons, demo.getMissingPersons);

/** 목업 id(MC-...)는 목업에서, 그 밖에는 백엔드에서 찾는다. 백엔드가 꺼져 있으면 없는 아동으로 본다. */
export async function getMissingPersonById(id: string) {
  return (await demo.getMissingPersonById(id)) ?? orDemo(() => fetchMissingPerson(id), async () => undefined);
}

/** 상세 화면용: 아동 정보에 대표 AI 사진과 미리 만들어 둔 스타일을 합친다. AI 사진이 없으면 그대로. */
export async function getMissingPersonWithAiImage(id: string) {
  const person = await getMissingPersonById(id);
  if (!person) return undefined;
  // 목업 아동은 사진이 이미 들어 있으니 백엔드에 묻지 않는다.
  return person.source === 'api' ? withAiImage(person, await fetchMissingAiImage(id)) : person;
}
