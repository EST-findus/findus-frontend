"use client";

import Modal from "./Modal";
import ServiceInfoContent from "./ServiceInfoContent";

export default function ServiceInfoModal({ onClose, returnFocusTo }: { onClose: () => void; returnFocusTo: HTMLElement | null }) {
  return (
    <Modal title="서비스 정보" onClose={onClose} returnFocusTo={returnFocusTo}>
      <ServiceInfoContent />
    </Modal>
  );
}
