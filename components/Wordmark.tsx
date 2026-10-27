/**
 * FindUs 글자 로고: i의 점 자리에 코랄 하트를 얹는다. 크기는 부모의 font-size를 따른다.
 * 하트 위치는 Pretendard ExtraBold의 점 없는 ı 기준(em): 막대 중심 0.14em, x높이 0.53em, 자간 -0.04em.
 */
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`whitespace-nowrap font-extrabold tracking-[-.04em] ${className}`}>
      <span className="sr-only">FindUs</span>
      <span aria-hidden="true">
        <span style={{ color: "#173B70" }}>F{"ı"}</span>
        {/* 크기 0인 기준점: 아래 변이 글자 기준선에 놓여, ı 바로 뒤에서 하트를 띄운다. */}
        <span className="relative inline-block size-0">
          <svg viewBox="0 0 20 18" className="absolute bottom-[.59em] left-[-.3em] h-[.378em] w-[.42em]">
            <path d="M10 17S1 11.6 1 5.8C1 1.4 6.6.2 10 4.2 13.4.2 19 1.4 19 5.8 19 11.6 10 17 10 17z" fill="#F28B82" />
          </svg>
        </span>
        <span style={{ color: "#173B70" }}>nd</span>
        <span style={{ color: "#3978B8" }}>Us</span>
      </span>
    </span>
  );
}
