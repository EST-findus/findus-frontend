"use client";

import Link from "next/link";
import { useState } from "react";
import type { MissingPerson } from "@/lib/types";
import PersonActions, { SECONDARY_ACTION } from "./PersonActions";
import ReportGuideModal from "./ReportGuideModal";

/** 공유용 상세 페이지의 버튼 줄. 목격 제보 안내는 모달로 띄운다. */
export default function PersonPageActions({ person }: { person: MissingPerson }) {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <>
      <PersonActions
        person={person}
        onReport={() => setReportOpen(true)}
        secondary={
          <Link href="/search" className={SECONDARY_ACTION}>
            목록으로
          </Link>
        }
      />
      {reportOpen && (
        <ReportGuideModal person={person} returnFocusTo={null} onClose={() => setReportOpen(false)} />
      )}
    </>
  );
}
