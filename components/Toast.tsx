export default function Toast({ message }: { message: string | null }) {
  // live region은 항상 렌더링해 두어야 스크린리더가 내용 변경을 읽는다.
  return (
    <div role="status" aria-live="polite">
      {message && (
        <div className="fixed bottom-6 left-1/2 z-200 w-[calc(100%-32px)] max-w-120 -translate-x-1/2 animate-toast-in rounded-xl bg-navy px-5 py-3.5 text-center text-[14px] font-semibold break-keep text-white shadow-modal motion-reduce:animate-none">
          {message}
        </div>
      )}
    </div>
  );
}
