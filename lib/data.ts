import { fetchMissingPersons, fetchMissingPerson, fetchMissingAiImage, withAiImage } from './missingApi';
export const getMissingPersons = fetchMissingPersons;
export const getMissingPersonById = fetchMissingPerson;

/** 상세 화면용: 아동 정보에 대표 AI 사진과 미리 만들어 둔 스타일을 합친다. AI 사진이 없으면 그대로. */
export async function getMissingPersonWithAiImage(id: string) {
  const person = await fetchMissingPerson(id);
  if (!person) return undefined;
  return withAiImage(person, await fetchMissingAiImage(id));
}
