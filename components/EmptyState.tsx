export default function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface px-5 py-17.5 text-center">
      <p className="text-[36px]" aria-hidden="true">
        🔎
      </p>
      <p className="mt-2 text-[17px] font-bold">일치하는 실종자 정보가 없습니다</p>
      <p className="mt-1.5 text-[14px] break-keep text-muted">
        이름, 지역명(예: 서울, 부산, 수원), 실종 당시 나이 등을 다시 확인해 주세요.
      </p>
    </div>
  );
}
