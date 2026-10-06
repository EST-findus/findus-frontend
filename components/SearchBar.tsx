"use client";

import { useRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      role="search"
      // 입력할 때마다 즉시 필터링되므로 Enter·돋보기는 페이지 이동만 막는다.
      onSubmit={(e) => e.preventDefault()}
      className="flex items-center gap-2 rounded-[14px] border-2 border-navy bg-card py-2 pr-2 pl-5 shadow-search transition-shadow focus-within:ring-4 focus-within:ring-navy/15"
    >
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="이름, 지역, 나이로 검색"
        aria-label="실종자 검색창"
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-[20px] font-bold outline-none placeholder:font-medium placeholder:text-subtle sm:text-[22px] [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          aria-label="검색어 지우기"
          className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-surface text-[12px] font-bold text-muted hover:bg-line focus-visible:outline-2 focus-visible:outline-navy"
        >
          ✕
        </button>
      )}
      <button
        type="submit"
        aria-label="검색"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-navy text-white transition-colors hover:bg-navy-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <line x1="15.5" y1="15.5" x2="21" y2="21" />
        </svg>
      </button>
    </form>
  );
}
