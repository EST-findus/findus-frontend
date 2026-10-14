import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { formatDate, formatGender } from "./format";
import { personUrl } from "./share";
import type { MissingPerson } from "./types";

// 서버 전용: 링크 미리보기(OG)와 SNS 스토리용 이미지를 그린다. satori는 woff2를 못 읽어 woff를 쓴다.
// 폰트 파일은 next.config.ts의 outputFileTracingIncludes로 배포 번들에 포함된다.

const C = {
  ink: "#1c2420",
  muted: "#66706a",
  line: "#e2e7e3",
  surface: "#f4f6f2",
  brand: "#22594a",
  brandSoft: "#e6efe9",
  gold: "#c99a3c",
  goldSoft: "#fbf3e2",
  goldInk: "#8a6418",
};

const FONT_DIR = join(process.cwd(), "node_modules/pretendard/dist/web/static/woff");

let fontsPromise: Promise<{ name: string; data: Buffer; weight: 500 | 700 | 800 }[]> | undefined;

function loadFonts() {
  fontsPromise ??= Promise.all(
    ([
      [500, "Medium"],
      [700, "Bold"],
      [800, "ExtraBold"],
    ] as const).map(async ([weight, file]) => ({
      name: "Pretendard",
      data: await readFile(join(FONT_DIR, `Pretendard-${file}.woff`)),
      weight,
    })),
  );
  return fontsPromise;
}

let logoPromise: Promise<string> | undefined;

function loadLogo() {
  logoPromise ??= readFile(join(process.cwd(), "public/images/findus-mark.svg")).then(
    (svg) => `data:image/svg+xml;base64,${svg.toString("base64")}`,
  );
  return logoPromise;
}

/** 원격 사진을 미리 받아 둔다. 실패해도 이미지 전체가 깨지지 않게 null을 돌려 빈 칸으로 그린다. */
async function fetchPhoto(src: string): Promise<string | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "image/jpeg";
    const data = Buffer.from(await res.arrayBuffer()).toString("base64");
    return `data:${type};base64,${data}`;
  } catch {
    return null;
  }
}

const CACHE_HEADERS = { "Cache-Control": "public, max-age=3600, s-maxage=86400" };

function Photo({
  src,
  width,
  height,
  ai,
  radius,
}: {
  src: string | null;
  width: number;
  height: number;
  ai: boolean;
  radius: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        width,
        height,
        borderRadius: radius,
        overflow: "hidden",
        background: C.surface,
        border: `4px solid ${ai ? C.brand : C.line}`,
      }}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        <img src={src} width={width} height={height} style={{ objectFit: "cover" }} />
      )}
    </div>
  );
}

function Brand({ logo, size }: { logo: string; size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.3 }}>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img src={logo} width={size} height={size} />
      <div style={{ display: "flex", fontSize: size * 0.72, fontWeight: 800 }}>
        <span style={{ color: C.brand }}>Find</span>
        <span style={{ color: C.gold }}>Us</span>
      </div>
    </div>
  );
}

/** 카카오톡·문자 등 링크 미리보기용 1200×630 */
export async function renderOgImage(person: MissingPerson) {
  const [fonts, logo, past, aged] = await Promise.all([
    loadFonts(),
    loadLogo(),
    fetchPhoto(person.photos.past),
    fetchPhoto(person.photos.aged),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: 56,
          gap: 56,
          background: "linear-gradient(135deg, #f6f9f5 0%, #e6efe9 100%)",
          borderBottom: `10px solid ${C.brand}`,
          fontFamily: "Pretendard",
          color: C.ink,
          wordBreak: "keep-all",
        }}
      >
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { src: past, ai: false, label: `실종 당시 ${person.ageAtMissing}세` },
            { src: aged, ai: true, label: `AI 예상 ${person.currentAge}세` },
          ].map((p) => (
            <div key={p.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <Photo src={p.src} width={270} height={360} ai={p.ai} radius={20} />
              <div style={{ fontSize: 24, fontWeight: 700, color: p.ai ? C.brand : C.muted }}>{p.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "8px 18px",
                borderRadius: 999,
                background: C.goldSoft,
                color: C.goldInk,
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              장기 실종아동을 찾습니다
            </div>
            <div style={{ marginTop: 20, fontSize: 76, fontWeight: 800, lineHeight: 1.1 }}>{person.name}</div>
            <div style={{ marginTop: 18, fontSize: 28, fontWeight: 700, color: C.brand }}>
              {`${formatDate(person.missingDate)} 실종 · ${formatGender(person.gender)}`}
            </div>
            <div style={{ marginTop: 10, fontSize: 26, fontWeight: 500, color: C.muted, lineHeight: 1.4 }}>
              {person.missingLocation}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Brand logo={logo} size={48} />
            <div style={{ fontSize: 22, fontWeight: 700, color: C.muted }}>목격 제보 · 경찰청 182</div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts, headers: CACHE_HEADERS },
  );
}

/** 인스타그램 등 스토리용 1080×1920. 이미지 속 링크는 누를 수 없어 QR을 함께 넣는다. */
export async function renderStoryImage(person: MissingPerson, origin: string) {
  const url = personUrl(origin, person.id);
  const [fonts, logo, past, aged, qr] = await Promise.all([
    loadFonts(),
    loadLogo(),
    fetchPhoto(person.photos.past),
    fetchPhoto(person.photos.aged),
    QRCode.toDataURL(url, { width: 360, margin: 1, color: { dark: C.ink, light: "#ffffff" } }),
  ]);

  const rows = [
    { label: "실종 일자", value: formatDate(person.missingDate) },
    { label: "실종 장소", value: person.missingLocation },
    { label: "성별", value: formatGender(person.gender) },
    { label: "특징", value: person.features },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          // 인스타그램 스토리의 상단 프로필·하단 답장 영역에 가리지 않게 위아래 여백을 넉넉히 둔다.
          padding: "140px 72px 150px",
          background: "linear-gradient(180deg, #eef3ec 0%, #ffffff 45%)",
          fontFamily: "Pretendard",
          color: C.ink,
          wordBreak: "keep-all",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Brand logo={logo} size={64} />
          <div
            style={{
              display: "flex",
              padding: "12px 26px",
              borderRadius: 999,
              background: C.goldSoft,
              color: C.goldInk,
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            장기 실종아동을 찾습니다
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 40 }}>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.1 }}>{person.name}</div>
          <div style={{ marginTop: 16, fontSize: 40, fontWeight: 700, color: C.brand }}>
            {`실종 당시 ${person.ageAtMissing}세 · 현재 추정 ${person.currentAge}세`}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 36 }}>
          {[
            { src: past, ai: false, label: "실종 당시 사진" },
            { src: aged, ai: true, label: "AI 예상 현재 모습" },
          ].map((p) => (
            <div key={p.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <Photo src={p.src} width={390} height={520} ai={p.ai} radius={28} />
              <div style={{ fontSize: 32, fontWeight: 700, color: p.ai ? C.brand : C.muted }}>{p.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 12, fontSize: 26, fontWeight: 500, color: C.muted }}>
          AI 예상 모습은 실제와 다를 수 있는 참고 자료입니다
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            marginTop: 32,
            padding: "32px 40px",
            borderRadius: 28,
            background: "#ffffff",
            border: `2px solid ${C.line}`,
          }}
        >
          {rows.map((r) => (
            <div key={r.label} style={{ display: "flex", gap: 28, fontSize: 32, lineHeight: 1.4 }}>
              <div style={{ width: 150, flexShrink: 0, fontWeight: 700, color: C.muted }}>{r.label}</div>
              <div style={{ flex: 1, fontWeight: 500 }}>{r.value}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 36,
            marginTop: "auto",
            padding: "32px 40px",
            borderRadius: 28,
            background: C.brand,
            color: "#ffffff",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ fontSize: 34, fontWeight: 700, opacity: 0.85 }}>목격하셨다면</div>
            <div style={{ marginTop: 6, fontSize: 64, fontWeight: 800 }}>경찰청 182</div>
            <div style={{ marginTop: 14, fontSize: 26, fontWeight: 500, opacity: 0.85 }}>
              {`관리번호 ${person.id} · QR로 자세히 보기`}
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={qr} width={200} height={200} style={{ borderRadius: 16 }} />
        </div>
      </div>
    ),
    { width: 1080, height: 1920, fonts, headers: CACHE_HEADERS },
  );
}
