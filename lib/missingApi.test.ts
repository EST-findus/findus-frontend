import {afterEach,describe,expect,it,vi} from 'vitest';
import {fetchMissingAiImage,fetchMissingPerson,fetchMissingPersons,normalizeDate,regionFromAddress,toMissingPerson,withAiImage,type MissingAiImageDto,type MissingPersonDto} from './missingApi';
import {DEFAULT_FILTERS,filterPersons} from './filter';
const id='00000000-0000-4000-8000-000000000001';
const image1='00000000-0000-4000-8000-000000000011';
const image2='00000000-0000-4000-8000-000000000012';
const fixture=(override:Partial<MissingPersonDto>={}):MissingPersonDto=>({id,sourceId:'1234',name:'테스트 아동',category:'010',sex:'여자',occurrenceDate:'20000520',age:5,ageNow:31,address:'서울특별시 종로구',clothing:null,features:null,photoUrl:'https://upstream.example/photo',images:[],lastSeenAt:'2026-10-20T04:40:00',attribution:'자료 출처: 경찰청',...override});
const page=(content:MissingPersonDto[],index=0,total=content.length,pages=1)=>new Response(JSON.stringify({content,page:index,size:100,totalElements:total,totalPages:pages}),{status:200});
afterEach(()=>vi.unstubAllGlobals());
describe('실제 데이터 변환',()=>{
  it('UUID와 경찰청 관리번호를 구분하고 AI 사진을 만들지 않는다',()=>{
    const person=toMissingPerson(fixture());
    expect(person.id).toBe(id);expect(person.sourceId).toBe('1234');expect(person.gender).toBe('여');expect(person.missingDate).toBe('2000-05-20');
    expect(person.photos).toEqual({past:'',aged:'',styles:[]});expect(person.features).toBe('정보 없음');
  });
  it('DB 사진을 순서대로 정렬해 프록시 주소로 변환한다',()=>{
    const image=(id:string,sortOrder:number)=>({id,sortOrder,url:'/api/missing-persons/'+fixture().id+'/images/'+id,contentType:'image/jpeg',byteSize:10});
    const person=toMissingPerson(fixture({images:[image(image2,1),image(image1,0)]}));
    expect(person.images?.map(p=>p.id)).toEqual([image1,image2]);expect(person.photos.past).toBe('/backend/api/missing-persons/'+id+'/images/'+image1);
  });
  it('대표(is_main) 사진만 아동 사진으로 쓴다',()=>{
    const image=(id:string,sortOrder:number)=>({id,sortOrder,url:'/api/missing-persons/'+fixture().id+'/images/'+id,contentType:'image/jpeg',byteSize:10});
    const person=toMissingPerson(fixture({photoUrl:image(image2,1).url,images:[image(image1,0),image(image2,1)]}));
    expect(person.images?.map(p=>p.id)).toEqual([image2]);expect(person.photos.past).toBe('/backend'+image(image2,1).url);
  });
  it('목록의 대표 AI 사진 주소는 이 아동의 경로일 때만 AI 예상 모습으로 쓴다',()=>{
    const warn=vi.spyOn(console,'warn').mockImplementation(()=>{});
    const photo='/api/missing-persons/'+id+'/ai-image/photo';
    expect(toMissingPerson(fixture({aiPhotoUrl:photo})).photos.aged).toBe('/backend'+photo);
    expect(toMissingPerson(fixture({aiPhotoUrl:null})).photos.aged).toBe('');
    expect(toMissingPerson(fixture({aiPhotoUrl:'https://example.com/ai.png'})).photos.aged).toBe('');
    expect(warn).toHaveBeenCalledTimes(1);expect(warn.mock.calls[0][0]).toContain('https://example.com/ai.png');warn.mockRestore();
  });
  it('외부 또는 다른 아동의 사진 경로는 사용하지 않는다',()=>{
    expect(()=>toMissingPerson(fixture({images:[{id:image1,sortOrder:0,url:'https://example.com/photo',contentType:'image/png',byteSize:10}]}))).toThrow();
  });
  it('없는 나이와 성별을 임의 값으로 채우지 않는다',()=>{
    const person=toMissingPerson(fixture({age:null,ageNow:null,sex:null,occurrenceDate:null,address:null}));
    expect(person.ageAtMissing).toBeNull();expect(person.gender).toBe('미상');expect(person.region).toBe('지역 정보 없음');
    expect(filterPersons([person],{query:'',filters:{...DEFAULT_FILTERS,ageGroup:'0-3'},sort:'recent'})).toEqual([]);
    expect(filterPersons([person],{query:'',filters:{...DEFAULT_FILTERS,period:'before2000'},sort:'recent'})).toEqual([]);
  });
  it('유효하지 않은 날짜를 거부한다',()=>{
    expect(normalizeDate('20000229')).toBe('2000-02-29');expect(normalizeDate('20010229')).toBe('');expect(normalizeDate('20001301')).toBe('');
  });
  it('지역은 확인 가능한 주소 접두어로 구분한다',()=>{
    expect(regionFromAddress('경기도 수원시')).toBe('경기');expect(regionFromAddress('전북특별자치도 전주시')).toBe('전북');expect(regionFromAddress('주거지')).toBe('지역 정보 없음');
  });
});
describe('조회 API',()=>{
  it('모든 페이지를 받아 두 번째 페이지의 아동도 검색한다',async()=>{
    const second=fixture({id:'00000000-0000-4000-8000-000000000002',name:'다음페이지 아동'});
    const fetch=vi.fn().mockResolvedValueOnce(page([fixture()],0,2,2)).mockResolvedValueOnce(page([second],1,2,2));vi.stubGlobal('fetch',fetch);
    const result=await fetchMissingPersons();expect(result).toHaveLength(2);
    expect(filterPersons(result,{query:'다음페이지',filters:DEFAULT_FILTERS,sort:'recent'})).toHaveLength(1);
    expect(fetch.mock.calls[1][0]).toContain('page=1&size=100');expect(fetch.mock.calls[0][1].cache).toBe('no-store');
    expect(fetch.mock.calls.every(call=>!call[1].method || call[1].method==='GET')).toBe(true);
  });
  it('부분 조회 실패를 빈 목록이나 예시 목록으로 감추지 않는다',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(page([fixture()],0,2,2)).mockResolvedValueOnce(new Response('',{status:503})));
    await expect(fetchMissingPersons()).rejects.toThrow();
  });
  it('갱신 중 중복 또는 누락된 목록을 전체로 표시하지 않는다',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(page([fixture()],0,2,2)).mockResolvedValueOnce(page([fixture()],1,2,2)));
    await expect(fetchMissingPersons()).rejects.toThrow();
  });
  it('정상 빈 DB는 빈 목록으로 표시한다',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(page([],0,0,0)));expect(await fetchMissingPersons()).toEqual([]);
  });
  it('없는 UUID는 404로 처리하고 서버 오류와 구분한다',async()=>{
    const fetch=vi.fn().mockResolvedValueOnce(new Response('',{status:404})).mockResolvedValueOnce(new Response('',{status:500}));vi.stubGlobal('fetch',fetch);
    expect(await fetchMissingPerson('invalid')).toBeUndefined();expect(fetch).not.toHaveBeenCalled();
    expect(await fetchMissingPerson(id)).toBeUndefined();await expect(fetchMissingPerson(id)).rejects.toThrow();
  });
  it('백엔드의 401 상세 응답은 공개 목록에서 부재가 확인된 경우에만 not-found로 처리한다',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(new Response('',{status:401})).mockResolvedValueOnce(page([],0,0,0)));
    expect(await fetchMissingPerson(id)).toBeUndefined();
    vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(new Response('',{status:401})).mockResolvedValueOnce(page([fixture()])));
    await expect(fetchMissingPerson(id)).rejects.toThrow();
    vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(new Response('',{status:401})).mockResolvedValueOnce(new Response('',{status:503})));
    await expect(fetchMissingPerson(id)).rejects.toThrow();
  });
  it('접속 실패는 명확한 조회 오류로 전달한다',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new TypeError('network failure')));await expect(fetchMissingPersons()).rejects.toThrow('백엔드 연결');
  });
});
describe('대표 AI 사진',()=>{
  const photo='/api/missing-persons/'+id+'/ai-image/photo';
  const ai=(override:Partial<MissingAiImageDto>={}):MissingAiImageDto=>({id:image1,targetAge:30,createdAt:'2026-10-26T01:00:00',url:photo,
    styles:[{key:'bob',name:'단발',url:photo+'?style=bob'},{key:'long',name:'긴 머리',url:photo+'?style=long'}],notice:'AI가 만든 예상 모습이며 실제 모습이 아닙니다.',...override});
  const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status});
  it('대표 AI 사진과 스타일을 프록시 주소로 변환해 아동 정보에 합친다',async()=>{
    vi.spyOn(console,'log').mockImplementation(()=>{});const fetch=vi.fn().mockResolvedValue(json(ai()));vi.stubGlobal('fetch',fetch);
    const result=await fetchMissingAiImage(id);
    expect(fetch.mock.calls[0][0]).toContain('/api/missing-persons/'+id+'/ai-image');
    expect(result?.url).toBe('/backend'+photo);expect(result?.targetAge).toBe(30);
    const person=withAiImage(toMissingPerson(fixture()),result);
    expect(person.photos.aged).toBe('/backend'+photo);
    expect(person.photos.styles).toEqual([{label:'단발',src:'/backend'+photo+'?style=bob'},{label:'긴 머리',src:'/backend'+photo+'?style=long'}]);
    expect(person.aiNote).toContain('실제 모습이 아닙니다');expect(person.aiTargetAge).toBe(30);
  });
  it('AI 사진이 없거나 조회에 실패해도 상세 화면을 깨지 않는다',async()=>{
    const log=vi.spyOn(console,'log').mockImplementation(()=>{});const error=vi.spyOn(console,'error').mockImplementation(()=>{});vi.spyOn(console,'warn').mockImplementation(()=>{});
    const fetch=vi.fn().mockResolvedValueOnce(new Response('',{status:404})).mockResolvedValueOnce(new Response('',{status:401}))
      .mockResolvedValueOnce(new Response('',{status:500})).mockRejectedValueOnce(new TypeError('network failure'));
    vi.stubGlobal('fetch',fetch);
    for (let i=0;i<4;i++) expect(await fetchMissingAiImage(id)).toBeUndefined();
    expect(await fetchMissingAiImage('invalid')).toBeUndefined();expect(fetch).toHaveBeenCalledTimes(4);
    expect(log.mock.calls[0][0]).toContain('없음');expect(error.mock.calls[0][0]).toContain('응답 상태 500');expect(error.mock.calls[1][0]).toContain('백엔드 연결 실패');
    const person=toMissingPerson(fixture());expect(withAiImage(person,undefined)).toBe(person);
  });
  it('다른 아동의 사진 경로와 잘못된 스타일은 쓰지 않는다',async()=>{
    vi.spyOn(console,'error').mockImplementation(()=>{});vi.spyOn(console,'warn').mockImplementation(()=>{});vi.spyOn(console,'log').mockImplementation(()=>{});
    const other='/api/missing-persons/00000000-0000-4000-8000-000000000002/ai-image/photo';
    vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(json(ai({url:other})))
      .mockResolvedValueOnce(json(ai({styles:[{key:'bob',name:'단발',url:other+'?style=bob'},{key:'Bad Key',name:'x',url:photo+'?style=Bad Key'},{key:'long',name:'긴 머리',url:photo+'?style=long'}]}))));
    expect(await fetchMissingAiImage(id)).toBeUndefined();
    expect((await fetchMissingAiImage(id))?.styles.map(s=>s.key)).toEqual(['long']);
  });
  it('대표를 먼저 두고 이 아동의 다른 AI 사진을 탭으로 붙인다',async()=>{
    vi.spyOn(console,'log').mockImplementation(()=>{});const warn=vi.spyOn(console,'warn').mockImplementation(()=>{});
    const photos='/api/missing-persons/'+id+'/ai-image/photos/';
    const a='00000000-0000-4000-8000-0000000000a1',b='00000000-0000-4000-8000-0000000000b1';
    const node=(nodeId:string,url:string,main=false)=>({id:nodeId,main,targetAge:30,createdAt:'2026-10-26T01:00:00',url});
    vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(json(ai({images:[node(image1,photo,true),node(a,photos+a),
      node(b,'/api/missing-persons/00000000-0000-4000-8000-000000000002/ai-image/photos/'+b),node(b,photos+b)]})))
      .mockResolvedValueOnce(json(ai())));
    const result=await fetchMissingAiImage(id);
    expect(result?.extras).toEqual([{id:a,label:'AI 사진 2',src:'/backend'+photos+a},{id:b,label:'AI 사진 3',src:'/backend'+photos+b}]);
    expect(warn.mock.calls[0][0]).toContain('잘못된 AI 사진 1개');
    const person=withAiImage(toMissingPerson(fixture()),result);
    expect(person.photos.aged).toBe('/backend'+photo);
    expect(person.photos.styles.map(s=>s.label)).toEqual(['AI 사진 2','AI 사진 3','단발','긴 머리']);
    expect((await fetchMissingAiImage(id))?.extras).toEqual([]);   // images가 없는 이전 백엔드
  });
});
