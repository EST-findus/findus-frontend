import Image from "next/image";

export default function SiteBrand() {
  return (
    <>
      <Image
        src="/images/findus-logo.png"
        alt=""
        width={32}
        height={32}
        className="shrink-0"
      />
      <span className="text-[18px] font-extrabold tracking-[-0.3px]">실종자 찾기 서비스</span>
      <span className="shrink-0 rounded-full bg-navy-soft px-2 py-0.5 text-[11px] font-bold text-navy">
        AI 몽타주
      </span>
    </>
  );
}
