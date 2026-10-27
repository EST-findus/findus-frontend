"use client";
import Modal from './Modal';
import StoredPhoto from './StoredPhoto';

/**
 * 사진을 크게 보여 준다. 상세 모달 위에 열리며, Esc·바깥 클릭으로 닫는다.
 * ai면 정사각 AI 사진으로, 아니면 세로형 원본 사진으로 보여 준다.
 */
export default function PhotoViewer({title,src,ai=false,onFail,onClose}:{title:string;src:string;ai?:boolean;onFail?:(src:string)=>void;onClose:()=>void}) {
  return <Modal title={title} onClose={onClose}>
    <div className={'relative mx-auto w-full overflow-hidden rounded-xl border bg-card '+(ai ? 'aspect-square max-w-[min(100%,70vh)] border-brand/40' : 'aspect-3/4 max-w-[min(100%,52vh)] border-line')}>
      <StoredPhoto ai={ai} urls={[src]} alt={title} sizes="(max-width: 680px) 90vw, 620px" fallback={false} onFail={onFail}/>
      {ai && <span className="absolute top-2 left-2 rounded-full bg-brand/85 px-2 py-0.5 text-[11px] font-bold text-white">AI</span>}
    </div>
    <p className="mt-3 text-center text-[12.5px] break-keep text-muted">{ai ? 'AI가 만든 예상 모습이며 실제 모습과 다를 수 있습니다.' : '자료 출처: 경찰청'}</p>
  </Modal>;
}
