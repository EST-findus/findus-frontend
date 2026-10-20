"use client";
import {useState} from 'react';
import type {MissingPerson} from '@/lib/types';
import StoredPhoto from './StoredPhoto';

export default function PersonPhotoGallery({person}:{person:MissingPerson}) {
  const images=person.images ?? [];
  const [selected,setSelected]=useState(0);
  const current=images[selected];
  return <section aria-label={person.name+' 저장된 사진'} className="min-w-0 rounded-xl border border-line bg-surface p-3">
    <div className="relative mx-auto aspect-3/4 w-full max-w-80 overflow-hidden rounded-lg bg-card">
      <StoredPhoto key={person.id+':'+selected} urls={current ? [current.url] : []} alt={person.name+' 사진 '+(selected+1)} fallback={false}/>
    </div>
    <p aria-live="polite" className="my-2 text-center text-xs text-muted">{images.length ? '사진 '+(selected+1)+' / '+images.length : '등록된 사진 없음'} · 자료 출처: 경찰청</p>
    {images.length>1 && <div role="group" aria-label="사진 선택" className="flex flex-wrap justify-center gap-2">{images.map((image,index)=><button type="button" key={image.id} aria-label={person.name+' 사진 '+(index+1)+' 선택'} aria-pressed={selected===index} onClick={()=>setSelected(index)} className={'relative h-20 w-16 overflow-hidden rounded-lg border-2 bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand '+(selected===index ? 'border-brand' : 'border-line')}>
      <StoredPhoto urls={[image.url]} alt={'사진 '+(index+1)} sizes="64px" fallback={false}/>
      <span className="absolute right-0 bottom-0 rounded-tl bg-ink/75 px-1 text-xs text-white">{index+1}</span>
    </button>)}</div>}
  </section>;
}
