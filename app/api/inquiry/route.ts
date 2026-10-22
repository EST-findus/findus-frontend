import { NextResponse } from "next/server";
import { formatInquiry, validateInquiry, type InquiryType } from "@/lib/inquiry";

// 문의는 INQUIRY_WEBHOOK_URL(Discord·Slack 웹훅 등)로 전달한다. 저장소에 쌓지 않는다.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });

  // 사람에게는 보이지 않는 칸. 값이 있으면 자동 입력(스팸)으로 보고 조용히 성공 처리한다.
  if (typeof body.website === "string" && body.website !== "") return NextResponse.json({ ok: true });

  const error = validateInquiry(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const inquiry = { type: body.type as InquiryType, message: String(body.message), email: String(body.email ?? ""), page: String(body.page ?? "").slice(0, 200) };
  const receivedAt = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const payload = formatInquiry(inquiry, receivedAt);

  const webhook = process.env.INQUIRY_WEBHOOK_URL;
  if (!webhook) {
    if (process.env.NODE_ENV !== "production") {
      console.info(payload.text);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "지금은 문의를 받을 수 없어요. 잠시 후 다시 시도해 주세요." }, { status: 503 });
  }

  const sent = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  }).catch(() => null);
  if (!sent?.ok) return NextResponse.json({ error: "문의를 보내지 못했어요. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
