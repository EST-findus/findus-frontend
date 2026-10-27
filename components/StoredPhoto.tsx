"use client";
import FadeInImage from './FadeInImage';
import { PersonSilhouette } from './loading/PhotoSkeleton';
import { useState } from 'react';

// Direct proxy requests preserve the backend's no-store response; no image optimizer cache.
export default function StoredPhoto({urls,alt,sizes='(max-width: 640px) 90vw, 400px',fallback=true,fit='contain',ai=false,onFail}:{urls:string[];alt:string;sizes?:string;fallback?:boolean;fit?:'contain'|'cover';ai?:boolean;onFail?:(src:string)=>void}) {
  const [failed,setFailed]=useState<string[]>([]);
  const src=urls.find(url=>!failed.includes(url));
  // 사진이 없으면 사람 실루엣을 바닥에 붙여 그린다. 안내 문구는 칸이 넉넉할 때(썸네일이 아닐 때)만 보인다.
  if(!src) return <div role="img" aria-label={urls.length ? '사진 조회 실패' : '등록된 사진 없음'} className="@container relative flex h-full min-h-20 w-full items-end justify-center overflow-hidden bg-linear-to-b from-surface to-brand-soft">
    <PersonSilhouette className="text-brand/25"/>
    <span className="absolute top-3 inset-x-0 text-center text-[12.5px] font-semibold text-muted @max-[11rem]:hidden">{urls.length ? '사진을 불러오지 못했습니다' : '등록된 사진 없음'}</span>
  </div>;
  return <FadeInImage key={src} ai={ai} src={src} alt={alt} fill sizes={sizes} unoptimized loading="lazy" style={{objectFit:fit,objectPosition:"center",width:"100%",height:"100%"}} onError={()=>{ onFail?.(src); setFailed(previous=>fallback ? [...previous,src] : [...urls]); }} />;
}
