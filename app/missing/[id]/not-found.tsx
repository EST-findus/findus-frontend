import Link from 'next/link';
export default function MissingNotFound(){return <main className="page-container py-24 text-center"><h1 className="text-2xl font-bold">공개된 아동 정보를 찾을 수 없습니다</h1><p className="mt-4 text-muted">주소가 잘못되었거나 현재 공개되지 않는 정보입니다.</p><Link href="/search" className="mt-6 inline-block rounded-xl bg-brand px-5 py-3 font-bold text-white">아동 목록으로</Link></main>;}
