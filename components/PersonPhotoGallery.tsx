"use client";
import {useState} from 'react';
import type {MissingPerson} from '@/lib/types';
import {formatAge} from '@/lib/format';
import StoredPhoto from './StoredPhoto';
import {logAiImageLoadFail} from './AiStylePhoto';
import {ScanFaceIcon} from './Icons';
import PhotoViewer from './PhotoViewer';

export default function PersonPhotoGallery({person,comparison=false}:{person:MissingPerson;comparison?:boolean}) {
  const images=person.images ?? [];
  const [selected,setSelected]=useState(0);
  const [zoomed,setZoomed]=useState<'original'|'ai'|null>(null);
  const current=images[selected];
  const original=<>
    {comparison && <p className="mb-2 text-xs font-bold text-muted">등록된 원본 사진</p>}
    {current ? <button type="button" onClick={()=>setZoomed('original')} aria-haspopup="dialog" aria-label={person.name+' 사진 '+(selected+1)+' 크게 보기'} className="group relative mx-auto block aspect-3/4 w-full max-w-80 cursor-zoom-in overflow-hidden rounded-xl bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
      <StoredPhoto key={person.id+':'+selected} urls={[current.url]} alt={person.name+' 사진 '+(selected+1)} fallback={false}/>
      {!comparison && <span aria-hidden="true" className="absolute right-2 bottom-2 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-bold text-white opacity-80 transition-opacity group-hover:opacity-100">크게 보기</span>}
    </button> : <div className="relative mx-auto aspect-3/4 w-full max-w-80 overflow-hidden rounded-xl bg-card">
      <StoredPhoto urls={[]} alt={person.name+' 사진'} fallback={false}/>
    </div>}
    {comparison && <p className="mt-2 text-center text-xs text-muted">당시 <strong>{formatAge(person.ageAtMissing)}</strong></p>}
    <p aria-live="polite" className="my-2.5 text-center text-[12.5px] text-muted">{images.length ? '사진 '+(selected+1)+' / '+images.length : '등록된 사진 없음'}{!comparison && ' · 자료 출처: 경찰청'}</p>
    {images.length>1 && <div role="group" aria-label="사진 선택" className={comparison ? "flex flex-wrap justify-center gap-1" : "flex flex-wrap justify-center gap-2"}>{images.map((image,index)=><button type="button" key={image.id} aria-label={person.name+' 사진 '+(index+1)+' 선택'} aria-pressed={selected===index} onClick={()=>setSelected(index)} className={'relative overflow-hidden rounded-lg border-2 bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand '+(comparison ? 'h-10 w-7 ' : 'h-20 w-16 ')+(selected===index ? 'border-brand' : 'border-line')}>
      <StoredPhoto urls={[image.url]} alt={'사진 '+(index+1)} sizes={comparison ? '36px' : '64px'} fallback={false}/>
      <span className="absolute right-0 bottom-0 rounded-tl bg-ink/75 px-1 text-xs text-white">{index+1}</span>
    </button>)}</div>}
  </>;
  return <section aria-label={person.name+(comparison ? ' 원본 사진과 AI 예상 모습 비교' : ' 저장된 사진')} className={'min-w-0 rounded-xl border border-line bg-surface '+(comparison ? 'p-3' : 'p-4')}>
    {comparison ? <>
      <div className="grid grid-cols-2 items-start gap-3">
        <div className="min-w-0">{original}</div>
        <figure className="min-w-0">
          <figcaption className="mb-2 flex items-center gap-1 text-xs font-bold text-muted"><span className="rounded bg-brand/10 px-1 text-[10px]">AI</span> 예상 모습</figcaption>
          <div className="relative mx-auto aspect-3/4 w-full max-w-80 overflow-hidden rounded-lg border border-dashed border-brand/20 bg-brand-soft/40">
            {person.photos.aged ? <button type="button" onClick={()=>setZoomed('ai')} aria-haspopup="dialog" aria-label={person.name+' AI 예상 모습 크게 보기'} className="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand">
              <StoredPhoto urls={[person.photos.aged]} alt={person.name+' AI 예상 모습'} fallback={false} onFail={src=>logAiImageLoadFail(src)}/>
            </button> : <div role="img" aria-label={person.name+' AI 예상 모습 준비 중'} className="flex h-full flex-col items-center justify-center gap-3 px-2 text-center text-muted">
              <ScanFaceIcon size={32} strokeWidth={1.3}/><strong className="text-xs">AI 예상 모습 준비 중</strong><span className="text-[11px] break-keep">생성된 이미지가 아직 없습니다</span>
            </div>}
          </div>
          <p className="mt-2 text-center text-xs text-muted">현재 <strong>{formatAge(person.currentAge)}</strong></p>
        </figure>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted">자료 출처: 경찰청 · {person.photos.aged ? 'AI 예상 모습은 실제 모습과 다를 수 있습니다.' : 'AI 예상 모습은 준비 중입니다.'}</p>
    </> : original}
    {zoomed==='original' && current && <PhotoViewer title={person.name+' 사진 '+(selected+1)} src={current.url} onClose={()=>setZoomed(null)}/>}
    {zoomed==='ai' && person.photos.aged && <PhotoViewer ai title={person.name+' AI 예상 모습'} src={person.photos.aged} onFail={src=>logAiImageLoadFail(src,'크게 보기')} onClose={()=>setZoomed(null)}/>}
  </section>;
}