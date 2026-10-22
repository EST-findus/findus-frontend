"use client";

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

export default function DetailModal({ person, returnFocusTo, onClose, onReport }: DetailModalProps) {
  return (
    <Modal mobileCompact title={person.name} onClose={onClose} returnFocusTo={returnFocusTo}>
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
