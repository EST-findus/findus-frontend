export default function Intro({ total }: { total: number }) {
  return (
    <div className="text-center">
      <h1 className="text-[30px] font-extrabold tracking-[-0.6px] break-keep text-navy max-sm:text-[24px]">
        실종자 AI 연령 변환 몽타주 검색
      </h1>
      <p className="mx-auto mt-2.5 max-w-[640px] text-[15px] break-keep text-muted">
        실종 당시 사진과 AI가 예측한 현재 모습을 비교해 보세요.
        <br className="max-sm:hidden" /> 비슷한 사람을 봤다면 182로 알려주세요.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2 text-[12px] font-semibold">
        <span className="rounded-full bg-white px-3 py-1">공개 중 {total}명</span>
        <span className="rounded-full bg-white px-3 py-1">AI 예상 사진 2종 제공</span>
      </div>
    </div>
  );
}
