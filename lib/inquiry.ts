/** 서비스 문의(개발자에게 보내는 메시지). 실종 제보는 받지 않고 182·112로 안내한다. */

export const INQUIRY_TYPES = ["오류 신고", "기능 제안", "정보 정정 요청", "기타"] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];

export const INQUIRY_MIN = 10;
export const INQUIRY_MAX = 1000;

export interface Inquiry {
  type: InquiryType;
  message: string;
  email: string;
  page: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 입력이 올바르면 null, 아니면 사용자에게 보여줄 문구를 돌려준다. */
export function validateInquiry(input: { type?: unknown; message?: unknown; email?: unknown; agree?: unknown }): string | null {
  if (!INQUIRY_TYPES.includes(input.type as InquiryType)) return "문의 유형을 골라 주세요.";
  const message = typeof input.message === "string" ? input.message.trim() : "";
  if (message.length < INQUIRY_MIN) return `내용을 ${INQUIRY_MIN}자 이상 적어 주세요.`;
  if (message.length > INQUIRY_MAX) return `내용은 ${INQUIRY_MAX}자까지 적을 수 있어요.`;
  const email = typeof input.email === "string" ? input.email.trim() : "";
  if (email && !EMAIL.test(email)) return "이메일 주소를 다시 확인해 주세요.";
  if (email && input.agree !== true) return "답변을 받으려면 이메일 수집에 동의해 주세요.";
  return null;
}

/** 웹훅으로 보낼 한 덩어리 글. Discord(content)·Slack(text) 모두 받을 수 있게 같은 글을 넣는다. */
export function formatInquiry({ type, message, email, page }: Inquiry, receivedAt: string) {
  const text = [`[FindUs 문의] ${type}`, message.trim(), `답변 이메일: ${email.trim() || "없음"}`, `보낸 화면: ${page || "알 수 없음"}`, `받은 시각: ${receivedAt}`].join("\n");
  return { content: text, text };
}
