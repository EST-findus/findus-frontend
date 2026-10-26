"use client";
import {useEffect,useState} from 'react';
import type {MissingPerson} from '@/lib/types';
import StoredPhoto from './StoredPhoto';
import StyleTabs from './StyleTabs';

/** 조회 API는 성공했는데 브라우저에서 사진 파일을 못 받는 경우(파일 없음, 프록시 오류 등)를 구분해 남긴다. */
export function logAiImageLoadFail(src:string,label='기본') {
  console.error('[AI 사진] 이미지 로드 실패 · '+label+' · '+src+' (Network 탭에서 상태 코드 확인)');
}

/** 대표 AI 사진과 미리 만들어 둔 머리 스타일. 버튼은 저장된 사진으로 바꾸기만 하고 새로 생성하지 않는다. */
export default function AiStylePhoto({person}:{person:MissingPerson}) {
  const choices=[{label:'기본',src:person.photos.aged},...person.photos.styles];
  const [selected,setSelected]=useState(0);
  const current=choices[selected] ?? choices[0];
  // 버튼을 누르는 순간 바뀌도록 스타일 사진을 미리 받아 둔다. 백엔드가 브라우저 캐시를 허용한다.
  useEffect(()=>{
    person.photos.styles.forEach(style=>{
      const image=new window.Image();
      image.onerror=()=>logAiImageLoadFail(style.src,style.label);
      image.src=style.src;
    });
  },[person.photos.styles]);
  return <section aria-label={person.name+' AI 예상 모습'} className="mt-5 rounded-xl border border-dashed border-brand/40 bg-brand-soft/40 p-3">
    <p className="mb-2 flex flex-wrap items-baseline gap-x-2 text-[12.5px] break-keep">
      <span className="font-bold text-brand">AI 예상 모습</span>
      {person.aiTargetAge ? <span className="text-muted">{person.aiTargetAge}세 기준</span> : null}
    </p>
    <div className="relative mx-auto aspect-square w-full max-w-80 overflow-hidden rounded-lg border border-brand/40 bg-card">
      <StoredPhoto key={current.src} urls={[current.src]} alt={person.name+' AI 예상 모습 ('+current.label+')'} fallback={false} onFail={src=>logAiImageLoadFail(src,current.label)}/>
      <span className="absolute top-1.5 left-1.5 rounded-full bg-brand/85 px-1.5 py-0.5 text-[10px] font-bold text-white">AI</span>
    </div>
    {choices.length>1 && <StyleTabs name={person.name} styles={choices} value={selected} onChange={setSelected} className="mt-3 flex-wrap justify-center"/>}
    <p className="mt-3 text-center text-[11.5px] leading-relaxed break-keep text-muted">{person.aiNote}</p>
  </section>;
}
