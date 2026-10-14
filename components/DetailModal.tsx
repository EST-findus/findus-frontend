"use client";

import type { MissingPerson } from "@/lib/types";
import Modal from "./Modal";
import PersonActions, { SECONDARY_ACTION } from "./PersonActions";
import PersonDetailBody from "./PersonDetailBody";

interface DetailModalProps {
  person: MissingPerson;
  returnFocusTo: HTMLElement | null;
  onClose: () => void;
  onReport: (person: MissingPerson) => void;
}

export default function DetailModal({ person, returnFocusTo, onClose, onReport }: DetailModalProps) {
  return (
    <Modal title={`${person.name} · 실종 당시와 AI 예상 모습 비교`} onClose={onClose} returnFocusTo={returnFocusTo}>
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
    </Modal>
  );
}
