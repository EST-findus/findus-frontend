"use client";
import {useRef,useState} from 'react';
import type {MissingPerson,StylePhoto} from '@/lib/types';
import StoredPhoto from './StoredPhoto';
import PhotoViewer from './PhotoViewer';

const FOCUS='focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

/** 조회 API는 성공했는데 브라우저에서 사진 파일을 못 받는 경우(파일 없음, 프록시 오류 등)를 구분해 남긴다. */
export function logAiImageLoadFail(src:string,label='기본') {
  console.error('[AI 사진] 이미지 로드 실패 · '+label+' · '+src+' (Network 탭에서 상태 코드 확인)');
}

/** 스타일 미리보기 썸네일. 라디오 그룹 관례대로 화살표 키로 선택을 옮기고, Tab은 선택된 항목 하나만 거친다. */
function StylePreviews({name,styles,value,onChange}:{name:string;styles:StylePhoto[];value:number;onChange:(index:number)=>void}) {
  const refs=useRef<(HTMLButtonElement|null)[]>([]);
  const handleKeyDown=(e:React.KeyboardEvent,index:number)=>{
    const last=styles.length-1;
    let next:number|null=null;
    if(e.key==='ArrowRight'||e.key==='ArrowDown') next=index===last ? 0 : index+1;
    if(e.key==='ArrowLeft'||e.key==='ArrowUp') next=index===0 ? last : index-1;
    if(next===null) return;
    e.preventDefault();
    onChange(next);
    refs.current[next]?.focus();
  };
  return <div role="radiogroup" aria-label={name+' 스타일 변형 선택'} className="grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-2.5">
    {styles.map((style,index)=>{
      const checked=index===value;
      return <button key={style.label} ref={el=>{refs.current[index]=el;}} type="button" role="radio" aria-checked={checked} tabIndex={checked ? 0 : -1} onClick={()=>onChange(index)} onKeyDown={e=>handleKeyDown(e,index)} className={'group min-w-0 rounded-lg text-center '+FOCUS}>
        <span className={'relative block aspect-square overflow-hidden rounded-lg border-2 bg-card transition-[border-color,box-shadow] '+(checked ? 'border-brand ring-3 ring-brand/15' : 'border-line group-hover:border-brand/50')}>
          <StoredPhoto urls={[style.src]} alt="" sizes="96px" fit="cover" fallback={false} onFail={src=>logAiImageLoadFail(src,style.label)}/>
        </span>
        <span className={'mt-1.5 block truncate text-[12.5px] '+(checked ? 'font-bold text-brand' : 'font-medium text-muted group-hover:text-ink')}>{style.label}</span>
      </button>;
    })}
  </div>;
}

/** 대표 AI 사진과 미리 만들어 둔 머리 스타일. 썸네일은 저장된 사진으로 바꾸기만 하고 새로 생성하지 않는다. */
export default function AiStylePhoto({person}:{person:MissingPerson}) {
  const choices=[{label:'대표',src:person.photos.aged},...person.photos.styles];
  const [selected,setSelected]=useState(0);
  const [zoomed,setZoomed]=useState(false);
  const current=choices[selected] ?? choices[0];
  const title=person.name+' AI 예상 모습 ('+current.label+')';
  return <section aria-label={person.name+' AI 예상 모습'} className="mt-7 rounded-2xl border border-dashed border-brand/40 bg-brand-soft/40 p-5 max-sm:p-4">
    <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-start max-sm:gap-4">
      <button type="button" onClick={()=>setZoomed(true)} aria-haspopup="dialog" aria-label={title+' 크게 보기'} className={'group relative mx-auto block aspect-square w-full max-w-90 cursor-zoom-in overflow-hidden rounded-xl border border-brand/40 bg-card '+FOCUS}>
        <StoredPhoto key={current.src} urls={[current.src]} alt={title} fallback={false} onFail={src=>logAiImageLoadFail(src,current.label)}/>
        <span className="absolute top-2 left-2 rounded-full bg-brand/85 px-2 py-0.5 text-[11px] font-bold text-white">AI</span>
        <span aria-hidden="true" className="absolute right-2 bottom-2 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-bold text-white opacity-80 transition-opacity group-hover:opacity-100">크게 보기</span>
      </button>
      <div className="flex min-w-0 flex-col gap-5">
        <div>
          <p className="flex flex-wrap items-baseline gap-x-2 break-keep">
            <span className="text-[16px] font-extrabold text-brand">AI 예상 모습</span>
            {person.aiTargetAge ? <span className="text-[13px] font-semibold text-muted">{person.aiTargetAge}세 기준</span> : null}
          </p>
          <p className="mt-1 text-[13px] break-keep text-muted">사진을 누르면 크게 볼 수 있어요.</p>
        </div>
        {choices.length>1 && <div>
          <p className="mb-2 text-[13px] font-bold text-ink">스타일 미리보기</p>
          <StylePreviews name={person.name} styles={choices} value={selected} onChange={setSelected}/>
        </div>}
        {person.aiNote && <p className="border-l-2 border-brand/45 pl-3 text-[13px] leading-[1.7] break-keep text-muted"><span className="font-bold text-brand">AI 분석 안내 · </span>{person.aiNote}</p>}
      </div>
    </div>
    {zoomed && <PhotoViewer ai title={title} src={current.src} onFail={src=>logAiImageLoadFail(src,'크게 보기 · '+current.label)} onClose={()=>setZoomed(false)}/>}
  </section>;
}
