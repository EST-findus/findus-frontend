import {getMissingPersonById} from '@/lib/data';
export const dynamic='force-dynamic';
// Personalized image generation is deferred. Never expose the fictional AI render for a live child.
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const person=await getMissingPersonById(id);
  return new Response(person ? '사진 공유 이미지는 아직 제공하지 않습니다. 상세 링크를 이용해 주세요.' : 'Not found',{status:404,headers:{'Cache-Control':'no-store'}});
}
