import type { CSSProperties } from "react";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const endpoint = "https://www.safe182.go.kr/api/lcm/findChildList.do";
const panel: CSSProperties = {
  padding: 20, border: "1px solid #cbd5e1", borderRadius: 12,
  background: "#fff", marginTop: 20, minWidth: 0,
};
const rawStyle: CSSProperties = {
  whiteSpace: "pre-wrap", overflowWrap: "anywhere", overflow: "auto",
  maxHeight: 480, padding: 16, background: "#f1f5f9", borderRadius: 8,
};
const fields = ["nm", "occrde", "age", "ageNow", "sexdstnDscd", "occrAdres", "etcSpfeat", "msspsnIdntfccd"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function display(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value) ?? "—";
}

function photoSource(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  const base64 = value.replace(/\s/g, "").replace(/^data:image\/jpe?g;base64,/i, "");
  // Accept missing padding, but reject non-JPEG and malformed base64 values.
  if (!base64.startsWith("/9j/") || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) return;
  const unpadded = base64.replace(/=+$/, "");
  if (unpadded.length % 4 === 1) return;
  const padded = unpadded.padEnd(Math.ceil(unpadded.length / 4) * 4, "=");
  const bytes = Buffer.from(padded, "base64");
  if (bytes.toString("base64") !== padded || bytes.length < 4 ||
      bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return;
  return `data:image/jpeg;base64,${padded}`;
}

type ApiResult = {
  page: string;
  rowSize: string;
  status?: number;
  statusText: string;
  body: string;
  data?: unknown;
  parsed: boolean;
  error: string;
  networkError: string;
  expiresAt: number;
};

// This local diagnostic page keeps only redacted results, never credentials.
// globalThis shares the store between the page and Server Action development bundles.
const resultStore = globalThis as typeof globalThis & {
  safeDreamTestResults?: Map<string, ApiResult>;
};
const results = resultStore.safeDreamTestResults ??= new Map<string, ApiResult>();
const resultCookie = "safedream-test-result";
const resultLifetime = 5 * 60 * 1000;

async function requestApi(formData: FormData) {
  "use server";

  const field = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim() : "";
  };
  const esntlId = field("esntlId") || process.env.SAFEDREAM_ESNTL_ID?.trim() || "";
  const authKey = field("authKey") || process.env.SAFEDREAM_AUTH_KEY?.trim() || "";
  const redact = (text: string) => {
    for (const secret of [authKey, esntlId]) {
      if (!secret) continue;
      const variants = [secret, encodeURIComponent(secret),
        new URLSearchParams({ v: secret }).toString().slice(2),
        JSON.stringify(secret).slice(1, -1)];
      for (const variant of variants) text = text.split(variant).join("[REDACTED]");
    }
    return text;
  };
  const page = field("page") || "1";
  const rowSize = field("rowSize") || "10";
  const result: ApiResult = {
    page: redact(page), rowSize: redact(rowSize), statusText: "", body: "",
    parsed: false, error: "", networkError: "", expiresAt: Date.now() + resultLifetime,
  };
  const validNumber = (value: string) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0;
  if (!esntlId || !authKey) {
    result.error = "발급 ID와 발급 KEY를 입력하세요. 입력값과 환경변수가 없어 API를 호출하지 않았습니다.";
  } else if (!validNumber(page) || !validNumber(rowSize)) {
    result.error = "page와 rowSize는 1 이상의 안전한 정수여야 합니다.";
  } else {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ esntlId, authKey, page, rowSize }),
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
      });
      result.status = response.status;
      result.statusText = redact(response.statusText);
      const responseBody = await response.text();
      result.body = redact(responseBody);
      try {
        result.data = JSON.parse(redact(JSON.stringify(JSON.parse(responseBody))));
        result.parsed = true;
      } catch {
        result.error = "응답 Body가 유효한 JSON 형식이 아닙니다.";
      }
      if (!response.ok) result.error = `HTTP 요청 실패 (${response.status}). ${result.error}`.trim();
    } catch (cause) {
      result.networkError = redact(cause instanceof Error ? cause.message : String(cause));
      result.error = "API 요청 또는 응답 수신 중 네트워크 오류가 발생했습니다. (제한 시간: 30초)";
    }
  }

  const cookieStore = await cookies();
  const previous = cookieStore.get(resultCookie)?.value;
  if (previous) results.delete(previous);
  for (const [id, stored] of results) {
    if (stored.expiresAt <= Date.now()) results.delete(id);
  }
  // Bound memory usage for this single-process development test page.
  while (results.size >= 20) results.delete(results.keys().next().value!);
  const id = randomUUID();
  result.expiresAt = Date.now() + resultLifetime;
  results.set(id, result);
  setTimeout(() => results.delete(id), resultLifetime).unref();
  cookieStore.set(resultCookie, id, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/safedream-test", maxAge: resultLifetime / 1000,
  });
  // Only a random result ID travels in the URL and cookie; credentials stay in POST.
  redirect(`/safedream-test?result=${id}`);
}

export default async function SafeDreamTestPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const id = typeof params.result === "string" ? params.result : undefined;
  const cookieStore = await cookies();
  const stored = id && cookieStore.get(resultCookie)?.value === id ? results.get(id) : undefined;
  const result = stored && stored.expiresAt > Date.now() ? stored : undefined;
  const { page = "1", rowSize = "10", status, statusText = "", body = "", data,
    parsed = false, error = "", networkError = "" } = result ?? {};
  const idConfigured = Boolean(process.env.SAFEDREAM_ESNTL_ID?.trim());
  const keyConfigured = Boolean(process.env.SAFEDREAM_AUTH_KEY?.trim());
  const list = isRecord(data) && Array.isArray(data.list) ? data.list : undefined;
  const photoCount = list?.filter((item) => isRecord(item) && photoSource(item.tknphotoFile)).length;
  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px", color: "#0f172a", overflowWrap: "anywhere" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>경찰청 안전Dream API 테스트</h1>
      <section style={panel}>
        <p><strong>API Endpoint:</strong> POST {endpoint}</p>
        <p>SAFEDREAM_ESNTL_ID: {idConfigured ? "설정됨" : "미설정 (직접 입력 가능)"}</p>
        <p>SAFEDREAM_AUTH_KEY: {keyConfigured ? "설정됨" : "미설정 (직접 입력 가능)"}</p>
        <p>발급 ID와 KEY를 입력하세요. 빈 입력란은 서버 환경변수가 설정되어 있으면 해당 값을 사용합니다.</p>
        <form action={requestApi} style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "end", marginTop: 16 }}>
          <label style={{ display: "grid", gap: 6 }}>
            발급 ID
            <input name="esntlId" type="text" autoComplete="off" required={!idConfigured}
              placeholder="발급 ID 입력" style={{ border: "1px solid #94a3b8", padding: 8, borderRadius: 6, width: 200 }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            발급 KEY
            <input name="authKey" type="password" autoComplete="off" required={!keyConfigured}
              placeholder="발급 KEY 입력" style={{ border: "1px solid #94a3b8", padding: 8, borderRadius: 6, width: 240 }} />
          </label>
          {([ ["page", page], ["rowSize", rowSize] ] as const).map(([name, value]) => (
            <label key={name} style={{ display: "grid", gap: 6 }}>
              요청 {name}
              <input name={name} type="number" min="1" step="1" required defaultValue={value}
                style={{ border: "1px solid #94a3b8", padding: 8, borderRadius: 6, width: 140 }} />
            </label>
          ))}
          <button type="submit" style={{ padding: "10px 18px", borderRadius: 6, background: "#1d4ed8", color: "white", cursor: "pointer" }}>API 요청</button>
        </form>
        <p style={{ marginTop: 12 }}>인증정보는 POST로 서버에 전달하며 결과 화면에 다시 채우지 않습니다. 다시 요청할 때 입력하세요.</p>
        <p>버튼을 누를 때만 서버에서 요청합니다. HTTP 2xx라도 API 자체 오류가 있을 수 있으므로 Raw JSON을 확인하세요.</p>
        <p>사진은 응답의 tknphotoFile을 사용합니다. 사진이 포함되지 않은 응답에서는 사진을 표시할 수 없습니다.</p>
      </section>
      {id && !result && <p role="alert" style={panel}>결과가 만료되었거나 서버가 재시작되었습니다. 인증정보를 입력하고 다시 요청하세요.</p>}
      {result && (
        <section style={panel}>
          <h2 style={{ fontSize: 22, fontWeight: 600 }}>요청 결과</h2>
          <p>HTTP Status: {status ?? "수신하지 못함"}</p>
          <p>Status Text: {status !== undefined ? statusText || "(없음)" : "수신하지 못함"}</p>
          <p>totalCount: {isRecord(data) && "totalCount" in data ? display(data.totalCount) : "응답에 없음"}</p>
          <p>응답 데이터 개수: {list ? list.length : "list 배열이 없습니다."}</p>
          <p>표시 가능한 사진 개수: {photoCount ?? "list 배열이 없습니다."}</p>
          {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
          {networkError && <p>네트워크 오류 메시지: {networkError}</p>}
          {(!parsed || error) && <><h3>응답 Body</h3><pre style={rawStyle}>{body || "(없음)"}</pre></>}
          <h3 style={{ fontSize: 20, marginTop: 20 }}>실종자 목록</h3>
          {list?.length === 0 && <p>응답 list가 비어 있습니다.</p>}
          {!list && <p>응답에 list 배열이 없어 카드를 표시할 수 없습니다.</p>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
            {list?.map((item: unknown, index: number) => {
              const source = isRecord(item) ? photoSource(item.tknphotoFile) : undefined;
              return (
                <article key={index} style={panel}>
                  <h4 style={{ fontWeight: 700 }}>실종자 {index + 1}</h4>
                  {source ? (
                    <object data={source} type="image/jpeg" aria-label={`실종자 ${index + 1} 사진`} style={{ display: "block", width: "100%", height: 200, marginTop: 12 }}>
                      <p>사진을 표시할 수 없습니다.</p>
                    </object>
                  ) : <p>사진이 없거나 유효한 Base64 JPEG 형식이 아닙니다.</p>}
                  {isRecord(item) ? <dl>{fields.filter((field) => item[field] !== undefined && item[field] !== null).map((field) => (
                    <div key={field} style={{ marginTop: 8 }}><dt style={{ fontWeight: 600 }}>{field}</dt><dd>{display(item[field])}</dd></div>
                  ))}</dl> : <pre style={rawStyle}>{display(item)}</pre>}
                </article>
              );
            })}
          </div>
          <h3 style={{ fontSize: 20, marginTop: 24 }}>Raw JSON</h3>
          <p>인증정보가 응답에 포함되면 [REDACTED]로 가립니다.</p>
          <pre style={rawStyle}>{parsed ? JSON.stringify(data, null, 2) : "유효한 JSON 응답이 없습니다. 위의 응답 Body와 오류를 확인하세요."}</pre>
        </section>
      )}
    </main>
  );
}
