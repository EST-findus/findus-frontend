"use client";
import {useRef,useState} from 'react';
import type {MissingPerson,StylePhoto} from '@/lib/types';
import StoredPhoto from './StoredPhoto';
import PhotoViewer from './PhotoViewer';
import {ArrowRightIcon,SparklesIcon} from './Icons';
import {formatAge} from '@/lib/format';

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
  return <div role="radiogroup" aria-label={name+' 스타일 변형 선택'} className="flex flex-wrap gap-3">
    {styles.map((style,index)=>{
      const checked=index===value;
      return <button key={style.label} ref={el=>{refs.current[index]=el;}} type="button" role="radio" aria-checked={checked} tabIndex={checked ? 0 : -1} onClick={()=>onChange(index)} onKeyDown={e=>handleKeyDown(e,index)} className={'group w-[76px] min-w-0 rounded-xl text-center '+FOCUS}>
        {/* 큰 사진과 같은 4:5 비율, 같은 흰 여백 액자를 작게 쓴다. */}
        <span className={'relative block aspect-[4/5] overflow-hidden rounded-xl border-[3px] border-white bg-card shadow-[0_4px_12px_rgba(23,59,112,.1)] transition-[box-shadow,transform] duration-200 motion-reduce:transition-none '+(checked ? 'ring-2 ring-brand' : 'ring-1 ring-line group-hover:-translate-y-0.5 group-hover:ring-brand/50 motion-reduce:group-hover:translate-y-0')}>
          <StoredPhoto ai urls={[style.src]} alt="" sizes="96px" fit="cover" fallback={false} onFail={src=>logAiImageLoadFail(src,style.label)}/>
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
  return <section aria-label={person.name+' AI 예상 모습'} className="relative mt-7 overflow-hidden rounded-3xl border border-brand/15 bg-linear-to-br from-brand-soft via-white to-coral-faint p-6 shadow-[0_10px_30px_rgba(23,59,112,.06)] max-sm:p-4">
    {/* 은은한 빛 번짐으로 카드 배경에 깊이를 준다. */}
    <span aria-hidden="true" className="pointer-events-none absolute -top-24 -left-20 size-64 rounded-full bg-brand/10 blur-3xl"/>
    <span aria-hidden="true" className="pointer-events-none absolute -right-16 -bottom-24 size-56 rounded-full bg-coral/15 blur-3xl"/>
    <div className="relative grid gap-7 sm:grid-cols-[minmax(0,280px)_minmax(0,1fr)] sm:items-center max-sm:gap-5">
      {/* 사진: 브랜드→코랄 그라데이션 테두리 안에 흰 여백을 한 겹 두른 액자 */}
      <div className="mx-auto w-full max-w-70 rounded-[22px] bg-linear-to-br from-brand/70 via-brand/25 to-coral/70 p-[2px] shadow-[0_16px_34px_rgba(23,59,112,.16)]">
        <button type="button" onClick={()=>setZoomed(true)} aria-haspopup="dialog" aria-label={title+' 크게 보기'} className={'group block w-full cursor-zoom-in rounded-[20px] bg-white p-1.5 '+FOCUS}>
          <span className="relative block aspect-[4/5] overflow-hidden rounded-[15px] bg-brand-soft">
            <span className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
              <StoredPhoto ai key={current.src} urls={[current.src]} alt={title} fit="cover" sizes="280px" fallback={false} onFail={src=>logAiImageLoadFail(src,current.label)}/>
            </span>
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-ink/45 to-transparent"/>
            <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-[7px] bg-brand px-2 py-1 text-[11.5px] font-extrabold text-white shadow-sm"><SparklesIcon size={12} strokeWidth={2.2}/>AI 예상</span>
            <span aria-hidden="true" className="absolute right-2.5 bottom-2.5 rounded-full bg-white/20 px-2.5 py-1 text-[11.5px] font-bold text-white backdrop-blur-sm transition-colors group-hover:bg-white/35">크게 보기</span>
          </span>
        </button>
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className="grid size-10 flex-none place-items-center rounded-xl bg-linear-to-br from-brand to-brand/75 text-white shadow-[0_6px_14px_rgba(23,59,112,.2)]"><SparklesIcon size={19} strokeWidth={2}/></span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 break-keep">
              <span className="text-[20px] leading-tight font-extrabold tracking-[-.4px] text-ink">AI 예상 모습</span>
              {person.aiTargetAge ? <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[12px] font-bold text-brand">{person.aiTargetAge}세 기준</span> : null}
            </p>
            <p className="mt-1 text-[13.5px] break-keep text-muted">사진을 누르면 크게 볼 수 있어요.</p>
          </div>
        </div>
        {/* 실종 당시 나이에서 AI 예상 나이까지를 한 줄 타임라인으로, 가운데에 흐른 햇수를 띄운다. */}
        {person.ageAtMissing!==null && person.aiTargetAge ? <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-white bg-white/75 px-5 py-3.5 shadow-[0_4px_14px_rgba(23,59,112,.06)] backdrop-blur-sm">
          <div><p className="text-[11.5px] font-bold text-muted">실종 당시</p><p className="text-[19px] font-extrabold tracking-[-.3px] text-ink tabular-nums">{formatAge(person.ageAtMissing)}</p></div>
          <div aria-hidden="true" className="relative flex items-center">
            <span className="size-2 flex-none rounded-full bg-brand/40"/>
            <span className="h-[2px] flex-1 bg-linear-to-r from-brand/30 via-brand/30 to-coral/70"/>
            <ArrowRightIcon size={15} strokeWidth={2.6} className="-ml-1 flex-none text-coral"/>
            {person.aiTargetAge>person.ageAtMissing && <span className="absolute left-1/2 -translate-x-1/2 rounded-full border border-coral-line bg-white px-2.5 py-0.5 text-[11.5px] font-extrabold whitespace-nowrap text-coral-ink shadow-sm">{person.aiTargetAge-person.ageAtMissing}년 뒤</span>}
          </div>
          <div className="text-right"><p className="text-[11.5px] font-bold text-brand">AI 예상</p><p className="text-[19px] font-extrabold tracking-[-.3px] text-brand tabular-nums">{person.aiTargetAge}세</p></div>
        </div> : null}
        {choices.length>1 && <div>
          <p className="mb-2 text-[13px] font-bold text-ink">스타일 미리보기</p>
          <StylePreviews name={person.name} styles={choices} value={selected} onChange={setSelected}/>
        </div>}
        {person.aiNote && <p className="flex gap-2.5 rounded-xl bg-brand-soft/70 px-3.5 py-3 text-[13px] leading-[1.7] break-keep text-muted"><SparklesIcon size={15} strokeWidth={2.2} className="mt-[3px] flex-none text-brand"/><span><span className="font-bold text-brand">AI 분석 안내 · </span>{person.aiNote}</span></p>}
      </div>
    </div>
    {zoomed && <PhotoViewer ai title={title} src={current.src} onFail={src=>logAiImageLoadFail(src,'크게 보기 · '+current.label)} onClose={()=>setZoomed(false)}/>}
  </section>;
}
