"use client";
import Image from 'next/image';
import { useState } from 'react';

// Direct proxy requests preserve the backend's no-store response; no image optimizer cache.
export default function StoredPhoto({urls,alt,sizes='(max-width: 640px) 90vw, 400px',fallback=true}:{urls:string[];alt:string;sizes?:string;fallback?:boolean}) {
  const [failed,setFailed]=useState<string[]>([]);
  const src=urls.find(url=>!failed.includes(url));
  if(!src) return <div role="img" aria-label={urls.length ? '사진 조회 실패' : '등록된 사진 없음'} className="flex h-full min-h-20 w-full items-center justify-center bg-surface p-3 text-center text-sm text-muted">{urls.length ? '사진을 불러오지 못했습니다' : '등록된 사진 없음'}</div>;
  return <Image key={src} src={src} alt={alt} fill sizes={sizes} unoptimized loading="lazy" className="object-contain" onError={()=>setFailed(previous=>fallback ? [...previous,src] : [...urls])} />;
}
