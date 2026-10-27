import type { MissingPerson } from './types';

export interface MissingImageDto { id: string; sortOrder: number; url: string; contentType: string; byteSize: number }
export interface MissingPersonDto {
  id: string; sourceId: string; name: string; category: string; sex: string | null;
  occurrenceDate: string | null; age: number | null; ageNow: number | null;
  address: string | null; clothing: string | null; features: string | null;
  photoUrl: string | null; images: MissingImageDto[]; lastSeenAt: string; attribution: string;
  /** Representative AI photo path, or null/absent when none. */
  aiPhotoUrl?: string | null;
}
interface PageDto { content: MissingPersonDto[]; page: number; size: number; totalElements: number; totalPages: number }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const text = (value: string | null | undefined) => value?.trim() || '정보 없음';
export function normalizeDate(raw: string | null): string {
  if (!raw || !/^\d{8}$/.test(raw)) return '';
  const iso = raw.slice(0,4)+'-'+raw.slice(4,6)+'-'+raw.slice(6,8);
  const date = new Date(iso+'T00:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === iso ? iso : '';
}
export function regionFromAddress(address: string | null): string {
  const value = address?.replace(/\s+/g,'') ?? '';
  const regions: [RegExp,string][] = [[/^서울/,'서울'],[/^부산/,'부산'],[/^대구/,'대구'],[/^인천/,'인천'],[/^광주/,'광주'],[/^대전/,'대전'],[/^울산/,'울산'],[/^세종/,'세종'],[/^(경기|수원|성남)/,'경기'],[/^강원/,'강원'],[/^(충청북|충북)/,'충북'],[/^(충청남|충남)/,'충남'],[/^(전라북|전북)/,'전북'],[/^(전라남|전남)/,'전남'],[/^(경상북|경북)/,'경북'],[/^(경상남|경남)/,'경남'],[/^제주/,'제주']];
  return regions.find(([pattern])=>pattern.test(value))?.[1] ?? '지역 정보 없음';
}
export function toMissingPerson(dto: MissingPersonDto): MissingPerson {
  if (!UUID.test(dto.id) || dto.category !== '010' || !Array.isArray(dto.images)) throw new Error('실종아동 응답 형식을 확인해 주세요.');
  // Use only DB photo endpoints. Upstream session-dependent photoUrl is never displayed.
  const all = [...dto.images].sort((a,b)=>a.sortOrder-b.sortOrder).map(image=>{
    const expected = '/api/missing-persons/'+dto.id+'/images/'+image.id;
    if (!UUID.test(image.id) || image.url !== expected) throw new Error('사진 응답 경로를 확인해 주세요.');
    return {id:image.id,sortOrder:image.sortOrder,url:'/backend'+expected};
  });
  // Upstream photos mix parents, montages and aged images; backend sets photoUrl to the is_main image, so show only that one.
  const main = all.find(image=>image.url === '/backend'+dto.photoUrl);
  const images = main ? [main] : all;
  // Same rule as DB photos: only this child's AI photo endpoint is accepted; anything else is ignored.
  const aiPhoto = '/api/missing-persons/'+dto.id+'/ai-image/photo';
  const aged = dto.aiPhotoUrl === aiPhoto ? '/backend'+aiPhoto : '';
  if(dto.aiPhotoUrl && !aged) console.warn('[AI 사진] 목록의 aiPhotoUrl이 이 아동 경로가 아니라 무시 · '+dto.id+' · 받은 값: '+dto.aiPhotoUrl+' · 기대: '+aiPhoto);
  const age = (value: number | null) => typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
  return {id:dto.id,source:'api',sourceId:dto.sourceId,name:text(dto.name),
    gender:dto.sex === '남자' || dto.sex === '남' ? '남' : dto.sex === '여자' || dto.sex === '여' ? '여' : '미상',
    ageAtMissing:age(dto.age),currentAge:age(dto.ageNow),missingDate:normalizeDate(dto.occurrenceDate),
    region:regionFromAddress(dto.address),missingLocation:text(dto.address),features:text(dto.features),clothing:text(dto.clothing),
    images,photos:{past:images[0]?.url ?? '',aged,styles:[]},aiNote:'',
    lastSyncedAt:dto.lastSeenAt,attribution:'자료 출처: 경찰청'};
}
async function request(path: string): Promise<Response> {
  const base = process.env.BACKEND_URL ?? 'http://localhost:18080';
  try {
    return await fetch(base.replace(/\/$/,'')+path,{cache:'no-store',signal:AbortSignal.timeout(15000)});
  } catch { throw new Error('아동 정보를 불러오지 못했습니다. 백엔드 연결을 확인하고 다시 시도해 주세요.'); }
}
async function pageAt(page: number): Promise<PageDto> {
  const response=await request('/api/missing-persons?page='+page+'&size=100');
  if (!response.ok) throw new Error('아동 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
  const data: PageDto=await response.json();
  if (!Array.isArray(data.content) || data.page !== page || data.size !== 100 || !Number.isInteger(data.totalPages) || data.totalPages < 0 || data.totalPages > 100 || !Number.isInteger(data.totalElements) || data.totalElements < 0) throw new Error('아동 목록 응답을 확인해 주세요.');
  return data;
}
export async function fetchMissingPersons(): Promise<MissingPerson[]> {
  const first=await pageAt(0);
  const entries=[...first.content];
  for(let i=1;i<first.totalPages;i++) {
    const page=await pageAt(i);
    if(page.totalElements!==first.totalElements || page.totalPages!==first.totalPages) throw new Error('아동 목록이 갱신되었습니다. 새로고침해 주세요.');
    entries.push(...page.content);
  }
  if(entries.length!==first.totalElements || new Set(entries.map(p=>p.id)).size!==entries.length) throw new Error('전체 목록을 불러오지 못했습니다. 새로고침해 주세요.');
  return entries.map(toMissingPerson);
}
export interface MissingAiImageNode { id: string; main: boolean; targetAge: number; createdAt: string; url: string }
export interface MissingAiImageDto {
  id: string; targetAge: number; createdAt: string; url: string;
  styles: {key: string; name: string; url: string}[]; notice: string;
  /** All active AI photos of this child, main first. Absent on older backends. */
  images?: MissingAiImageNode[];
}
export interface MissingAiImage {
  targetAge: number | null; url: string; styles: {key: string; label: string; src: string}[]; notice: string;
  /** 대표를 뺀 이 아동의 다른 AI 사진, 백엔드가 준 순서(만든 순서). */
  extras: {id: string; label: string; src: string}[];
}
const STYLE_KEY = /^[a-z0-9_]{1,32}$/;
/** 조회 결과를 원인별로 남긴다. "없음"은 log, 응답 이상은 warn, 조회 실패는 error. */
const aiLog = {
  none: (id: string, reason: string) => console.log('[AI 사진] 없음 · '+id+' · '+reason),
  warn: (id: string, reason: string, detail?: unknown) => console.warn('[AI 사진] 응답 확인 필요 · '+id+' · '+reason, detail ?? ''),
  fail: (id: string, reason: string, detail?: unknown) => console.error('[AI 사진] 조회 실패 · '+id+' · '+reason, detail ?? ''),
};
/** Representative AI photo is optional: any failure hides the AI section instead of breaking the detail page. */
export async function fetchMissingAiImage(id: string): Promise<MissingAiImage | undefined> {
  if(!UUID.test(id)) { aiLog.warn(id,'UUID 형식이 아니어서 조회하지 않음'); return undefined; }
  let response: Response;
  try { response=await request('/api/missing-persons/'+id+'/ai-image'); }
  catch(error) { aiLog.fail(id,'백엔드 연결 실패 또는 15초 시간 초과',error); return undefined; }
  // 404 means no AI photo yet; 401 can be a secured /error dispatch of the same 404.
  if(response.status===404) { aiLog.none(id,'생성된 AI 사진이 없음 (404)'); return undefined; }
  if(response.status===401) { aiLog.none(id,'401 응답: 사진이 없거나 인증이 필요함 (백엔드 확인)'); return undefined; }
  if(!response.ok) {
    const body=await response.text().catch(()=>'');
    aiLog.fail(id,'응답 상태 '+response.status,body.slice(0,300));
    return undefined;
  }
  let dto: MissingAiImageDto;
  try { dto=await response.json(); }
  catch(error) { aiLog.fail(id,'응답 JSON 파싱 실패',error); return undefined; }
  const photo='/api/missing-persons/'+id+'/ai-image/photo';
  if(!dto || dto.url!==photo) { aiLog.fail(id,'사진 경로가 이 아동의 경로가 아님 (기대: '+photo+')',dto?.url); return undefined; }
  if(!Array.isArray(dto.styles)) { aiLog.fail(id,'styles가 배열이 아님',dto.styles); return undefined; }
  // Only DB style endpoints of this child; drop anything else.
  const valid=(s: MissingAiImageDto['styles'][number])=>STYLE_KEY.test(s?.key) && s.url===photo+'?style='+s.key && !!s.name?.trim();
  const dropped=dto.styles.filter(s=>!valid(s));
  if(dropped.length) aiLog.warn(id,'잘못된 스타일 '+dropped.length+'개 제외',dropped);
  const styles=dto.styles.filter(valid).map(s=>({key:s.key,label:s.name.trim(),src:'/backend'+s.url}));
  const targetAge=Number.isInteger(dto.targetAge) && dto.targetAge>0 ? dto.targetAge : null;
  if(targetAge===null) aiLog.warn(id,'targetAge가 올바르지 않아 나이 표시 생략',dto.targetAge);
  // Other AI photos of this child; images is absent on older backends. The main one is already shown as aged.
  const images=Array.isArray(dto.images) ? dto.images : [];
  const validImage=(image: MissingAiImageNode)=>UUID.test(image?.id) && image.url===photo.replace(/\/photo$/,'/photos/')+image.id;
  const others=images.filter(image=>!image?.main && image?.url!==photo);
  const droppedImages=others.filter(image=>!validImage(image));
  if(droppedImages.length) aiLog.warn(id,'잘못된 AI 사진 '+droppedImages.length+'개 제외',droppedImages);
  const extras=others.filter(validImage).map((image,i)=>({id:image.id,label:'AI 사진 '+(i+2),src:'/backend'+image.url}));
  console.log('[AI 사진] 조회 성공 · '+id+' · 사진 '+(extras.length+1)+'장 · 스타일 '+styles.length+'개'+(targetAge ? ' · '+targetAge+'세 기준' : ''));
  return {targetAge,url:'/backend'+photo,styles,extras,notice:dto.notice?.trim() || 'AI가 만든 예상 모습이며 실제 모습이 아닙니다.'};
}
export function withAiImage(person: MissingPerson, ai: MissingAiImage | undefined): MissingPerson {
  if(!ai) return person;
  // Tabs: main (aged) first, then other AI photos, then pre-made styles of the main photo.
  return {...person,aiTargetAge:ai.targetAge,aiNote:ai.notice,
    photos:{...person.photos,aged:ai.url,styles:[...ai.extras,...ai.styles].map(({label,src})=>({label,src}))}};
}
export async function fetchMissingPerson(id: string): Promise<MissingPerson | undefined> {
  if(!UUID.test(id)) return undefined;
  const response=await request('/api/missing-persons/'+id);
  if(response.status===404) return undefined;
  // Current backend secures the /error dispatch, so a missing detail can surface as 401.
  // Verify absence using the public list; never interpret all 401 responses as not-found.
  if(response.status===401) {
    const available=await fetchMissingPersons();
    if(!available.some(person=>person.id===id)) return undefined;
  }
  if(!response.ok) throw new Error('아동 상세정보를 불러오지 못했습니다. 다시 시도해 주세요.');
  const dto: MissingPersonDto=await response.json();
  if(dto.id!==id) throw new Error('아동 상세정보 식별자가 일치하지 않습니다.');
  return toMissingPerson(dto);
}
