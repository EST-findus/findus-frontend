"use client";
import {useState} from 'react';
import type {MissingPerson} from '@/lib/types';
import {personUrl,shareTitle,shareText} from '@/lib/share';
import Modal from './Modal';
export default function LiveShareModal({person,onClose,returnFocusTo}:{person:MissingPerson;onClose:()=>void;returnFocusTo?:HTMLElement|null}) {
  const [status,setStatus]=useState('');
  const url=personUrl(window.location.origin,person.id);
  return <Modal title={person.name+' 링크 공유'} onClose={onClose} returnFocusTo={returnFocusTo}>
    <p className="mb-4 text-sm text-muted">현재 공개된 아동 정보를 확인할 수 있는 상세 링크입니다.</p>
    <label className="block text-sm font-bold">공유 링크<input readOnly value={url} onFocus={e=>e.currentTarget.select()} className="mt-2 w-full rounded-lg border border-line p-3 text-sm"/></label>
    <div className="mt-4 flex flex-wrap gap-3"><button type="button" className="rounded-xl bg-brand px-5 py-3 font-bold text-white" onClick={async()=>{try{await navigator.clipboard.writeText(url);setStatus('링크를 복사했습니다.');}catch{setStatus('링크를 선택해 직접 복사해 주세요.');}}}>링크 복사</button>
    {typeof navigator.share==='function' && <button type="button" className="rounded-xl border border-line px-5 py-3 font-bold" onClick={async()=>{try{await navigator.share({url,title:shareTitle(person),text:shareText(person)});}catch(error){if(!(error instanceof DOMException && error.name==='AbortError'))setStatus('공유 창을 열지 못했습니다. 링크 복사를 이용해 주세요.');}}}>다른 앱으로 공유</button>}</div>
    <p role="status" className="mt-3 text-sm text-brand">{status}</p><p className="mt-3 text-xs text-muted">자료 출처: 경찰청 · 외부에서 링크를 열려면 공개된 서비스 주소가 필요합니다.</p>
  </Modal>;
}
