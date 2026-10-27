"use client";

import { useEffect, useState } from "react";
import { fetchMissingAiImage, withAiImage, type MissingAiImage } from "@/lib/missingApi";
import type { MissingPerson } from "@/lib/types";
import MobilePersonDetail from "./MobilePersonDetail";
import Modal from "./Modal";
import PersonActions, { SECONDARY_ACTION } from "./PersonActions";
import PersonDetailBody from "./PersonDetailBody";

interface DetailModalProps {
  person: MissingPerson;
  returnFocusTo: HTMLElement | null;
  onClose: () => void;
  onReport: (person: MissingPerson) => void;
}

/** 목록 응답에는 대표 AI 사진 주소만 있으므로, 모달을 열 때 이 아동의 AI 사진 전체와 스타일을 받아 합친다. */
function useAiImage(person: MissingPerson): MissingPerson {
  const [ai, setAi] = useState<{ id: string; value: MissingAiImage | undefined }>();
  const needed = person.source === "api" && Boolean(person.photos.aged);
  useEffect(() => {
    if (!needed) return;
    let alive = true;
    fetchMissingAiImage(person.id).then((value) => { if (alive) setAi({ id: person.id, value }); });
    return () => { alive = false; };
  }, [person.id, needed]);
  return needed && ai?.id === person.id ? withAiImage(person, ai.value) : person;
}

export default function DetailModal({ person: listPerson, returnFocusTo, onClose, onReport }: DetailModalProps) {
  const person = useAiImage(listPerson);
  return (
    <Modal mobileCompact size="wide" title={person.name} onClose={onClose} returnFocusTo={returnFocusTo}>
      <MobilePersonDetail person={person} onReport={() => onReport(person)} />
      <div className="max-md:hidden">
        <PersonDetailBody person={person} />
        <PersonActions
          person={person}
          onReport={() => onReport(person)}
          secondary={
            <button type="button" onClick={onClose} className={SECONDARY_ACTION}>
              닫기
            </button>
          }
        />
      </div>
    </Modal>
  );
}
