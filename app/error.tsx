"use client";
import {useRouter} from 'next/navigation';
export default function ErrorPage({reset}:{error:Error & {digest?:string};reset:()=>void}) {
  const router=useRouter();
  return <main className="page-container py-24 text-center"><h1 className="text-2xl font-bold">정보를 불러오지 못했습니다</h1><p role="alert" className="mt-4 text-muted">일시적인 연결 오류일 수 있습니다. 잠시 후 다시 시도해 주세요. 로컬 실행 중이라면 백엔드 서버가 켜져 있는지 확인해 주세요.</p><button type="button" onClick={()=>{router.refresh();reset();}} className="mt-6 rounded-xl bg-brand px-6 py-3 font-bold text-white">다시 시도</button></main>;
}
