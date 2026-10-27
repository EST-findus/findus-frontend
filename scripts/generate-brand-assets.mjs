/**
 * FindUs 아이콘과 공유 이미지 생성기: `npm run generate:brand`
 *
 * 심볼은 components/LogoMark.tsx, 글자 로고는 components/Wordmark.tsx와 같은 그림이다.
 * 로고를 바꾸면 이 파일의 그림도 함께 고친 뒤 다시 실행한다.
 *
 * 글자는 Pretendard OTF의 글리프 윤곽을 직접 읽어 SVG 경로로 바꾼다.
 * sharp(librsvg)의 <text>는 운영체제 글꼴로 대체되어 PC마다 결과가 달라지기 때문이다.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fontDir = join(root, "node_modules/pretendard/dist/public/static");

const NAVY = "#173B70";
const BLUE = "#3978B8";
const SOFT = "#EAF2F9";
const CORAL = "#F28B82";
const INK = "#1D2733";
const MUTED = "#5B6675";

/** 하트 윤곽 (Wordmark.tsx와 같은 20×18 상자). */
const HEART = "M10 17S1 11.6 1 5.8C1 1.4 6.6.2 10 4.2 13.4.2 19 1.4 19 5.8 19 11.6 10 17 10 17z";

/* ───────────── 심볼 ───────────── */

/** LogoMark.tsx의 i 막대와 하트 (72 격자). */
const markArt = [
  `<rect x="31" y="32" width="10" height="26" rx="2" fill="${NAVY}"/>`,
  `<path d="M36 27.5S25.5 21.3 25.5 14.7C25.5 9.7 32.2 8.3 36 12.9 39.8 8.3 46.5 9.7 46.5 14.7 46.5 21.3 36 27.5 36 27.5z" fill="${CORAL}"/>`,
].join("");

/**
 * 72 격자 심볼 SVG.
 * fullBleed: 모서리 없이 바탕을 꽉 채운다 (iOS·maskable처럼 기기가 모양을 잘라 내는 아이콘).
 * artScale: 가운데를 기준으로 그림만 줄인다 (maskable 안전 영역).
 */
function markSvg({ size, fullBleed = false, artScale = 1 } = {}) {
  const tile = fullBleed ? `<rect width="72" height="72" fill="${SOFT}"/>` : `<rect width="72" height="72" rx="18" fill="${SOFT}"/>`;
  const art = artScale === 1 ? markArt : `<g transform="translate(36 36) scale(${artScale}) translate(-36 -36)">${markArt}</g>`;
  const dims = size ? ` width="${size}" height="${size}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"${dims} fill="none">\n  ${tile}\n  ${art}\n</svg>\n`;
}

/** 16px 전용 심볼: 픽셀 격자에 맞춰 막대를 4px로, 하트를 더 크게 그린다. */
function markSvg16() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none">
  <rect width="16" height="16" rx="3.5" fill="${SOFT}"/>
  <rect x="6" y="8" width="4" height="6" rx=".5" fill="${NAVY}"/>
  <path transform="translate(4.5 1.2) scale(.35)" d="${HEART}" fill="${CORAL}"/>
</svg>`;
}

const png = (svg, size) => sharp(Buffer.from(svg), { density: 72 * 8 }).resize(size, size).png().toBuffer();

/** PNG 항목을 그대로 담는 ICO (Vista 이후 모든 브라우저가 읽는다). */
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(size % 256, entry);
    header.writeUInt8(size % 256, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map(({ data }) => data)]);
}

/* ───────────── 글꼴 (OTF/CFF → SVG 경로) ───────────── */

function readIndex(b, start) {
  const count = b.readUInt16BE(start);
  if (count === 0) return { items: [], end: start + 2 };
  const offSize = b[start + 2];
  const readOff = (i) => {
    let v = 0;
    for (let k = 0; k < offSize; k++) v = v * 256 + b[start + 3 + i * offSize + k];
    return v;
  };
  const base = start + 2 + (count + 1) * offSize;
  const items = [];
  for (let i = 0; i < count; i++) items.push([base + readOff(i), base + readOff(i + 1)]);
  return { items, end: base + readOff(count) };
}

function readDict(b, start, end) {
  const dict = {};
  let ops = [];
  for (let p = start; p < end; ) {
    const v = b[p];
    if (v <= 21) {
      let key = v;
      p++;
      if (v === 12) key = 1200 + b[p++];
      dict[key] = ops;
      ops = [];
    } else if (v === 28) {
      ops.push(b.readInt16BE(p + 1));
      p += 3;
    } else if (v === 29) {
      ops.push(b.readInt32BE(p + 1));
      p += 5;
    } else if (v === 30) {
      // 실수 값은 쓰지 않으므로 건너뛴다.
      p++;
      while ((b[p] & 0x0f) !== 0x0f && b[p] >> 4 !== 0x0f) p++;
      p++;
      ops.push(0);
    } else if (v <= 246) {
      ops.push(v - 139);
      p++;
    } else if (v <= 250) {
      ops.push((v - 247) * 256 + b[p + 1] + 108);
      p += 2;
    } else {
      ops.push(-(v - 251) * 256 - b[p + 1] - 108);
      p += 2;
    }
  }
  return dict;
}

const subrBias = (n) => (n < 1240 ? 107 : n < 33900 ? 1131 : 32768);

function loadFont(file) {
  const b = readFileSync(join(fontDir, file));
  const tables = {};
  for (let i = 0; i < b.readUInt16BE(4); i++) {
    const o = 12 + i * 16;
    tables[b.toString("latin1", o, o + 4)] = b.readUInt32BE(o + 8);
  }

  const unitsPerEm = b.readUInt16BE(tables.head + 18);
  const numHMetrics = b.readUInt16BE(tables.hhea + 34);
  const advance = (gid) => b.readUInt16BE(tables.hmtx + Math.min(gid, numHMetrics - 1) * 4);

  // cmap: 유니코드 전체(3,10 형식 12) 우선, 없으면 BMP(3,1 형식 4)
  const cmap = new Map();
  const c = tables.cmap;
  const subtables = [];
  for (let i = 0; i < b.readUInt16BE(c + 2); i++) {
    const r = c + 4 + i * 8;
    if (b.readUInt16BE(r) === 3) subtables.push(c + b.readUInt32BE(r + 4));
  }
  for (const s of subtables) {
    const format = b.readUInt16BE(s);
    if (format === 12) {
      for (let g = 0; g < b.readUInt32BE(s + 12); g++) {
        const r = s + 16 + g * 12;
        const first = b.readUInt32BE(r);
        const last = b.readUInt32BE(r + 4);
        const gid = b.readUInt32BE(r + 8);
        for (let cp = first; cp <= last; cp++) cmap.set(cp, gid + cp - first);
      }
    } else if (format === 4 && cmap.size === 0) {
      const segX2 = b.readUInt16BE(s + 6);
      const ends = s + 14;
      const starts = ends + segX2 + 2;
      const deltas = starts + segX2;
      const ranges = deltas + segX2;
      for (let i = 0; i < segX2; i += 2) {
        const first = b.readUInt16BE(starts + i);
        const last = b.readUInt16BE(ends + i);
        const delta = b.readUInt16BE(deltas + i);
        const range = b.readUInt16BE(ranges + i);
        for (let cp = first; cp <= last && cp !== 0xffff; cp++) {
          let gid = range === 0 ? cp + delta : b.readUInt16BE(ranges + i + range + (cp - first) * 2);
          if (range !== 0 && gid !== 0) gid += delta;
          cmap.set(cp, gid & 0xffff);
        }
      }
    }
  }

  // CFF
  const cff = tables["CFF "];
  const names = readIndex(b, cff + b[cff + 2]);
  const topDicts = readIndex(b, names.end);
  const strings = readIndex(b, topDicts.end);
  const gsubrs = readIndex(b, strings.end).items;
  const top = readDict(b, ...topDicts.items[0]);
  const charStrings = readIndex(b, cff + top[17][0]).items;

  const privateSubrs = ([size, offset]) => {
    const priv = readDict(b, cff + offset, cff + offset + size);
    return priv[19] ? readIndex(b, cff + offset + priv[19][0]).items : [];
  };
  let subrsFor;
  if (top[1236]) {
    // CID 글꼴: 글리프마다 FDSelect로 고른 Private DICT의 Subrs를 쓴다.
    const fds = readIndex(b, cff + top[1236][0]).items.map(([s, e]) => privateSubrs(readDict(b, s, e)[18]));
    const sel = cff + top[1237][0];
    const fdOf = (gid) => {
      if (b[sel] === 0) return b[sel + 1 + gid];
      const n = b.readUInt16BE(sel + 1);
      for (let i = 0; i < n; i++) {
        const r = sel + 3 + i * 3;
        if (gid >= b.readUInt16BE(r) && gid < b.readUInt16BE(r + 3)) return b[r + 2];
      }
      return 0;
    };
    subrsFor = (gid) => fds[fdOf(gid)];
  } else {
    const subrs = top[18] ? privateSubrs(top[18]) : [];
    subrsFor = () => subrs;
  }

  /** Type 2 charstring을 글꼴 단위(위쪽이 +y)의 경로 명령으로 해석한다. */
  function outline(gid) {
    const subrs = subrsFor(gid);
    const cmds = [];
    const stack = [];
    let x = 0;
    let y = 0;
    let stems = 0;
    let widthDone = false;
    let open = false;

    const close = () => {
      if (open) cmds.push(["Z"]);
      open = false;
    };
    const moveTo = (dx, dy) => {
      close();
      x += dx;
      y += dy;
      cmds.push(["M", x, y]);
      open = true;
    };
    const lineTo = (dx, dy) => {
      x += dx;
      y += dy;
      cmds.push(["L", x, y]);
    };
    const curveTo = (a, b2, c2, d, e, f) => {
      const x1 = x + a;
      const y1 = y + b2;
      const x2 = x1 + c2;
      const y2 = y1 + d;
      x = x2 + e;
      y = y2 + f;
      cmds.push(["C", x1, y1, x2, y2, x, y]);
    };
    // 첫 스택 소거 연산자의 남는 인수는 폭(width)이다.
    const takeWidth = (expectOdd) => {
      if (!widthDone && stack.length % 2 === (expectOdd ? 0 : 1)) stack.shift();
      widthDone = true;
    };

    function run([start, end]) {
      for (let p = start; p < end; ) {
        const v = b[p];
        if (v >= 32 || v === 28) {
          if (v === 28) {
            stack.push(b.readInt16BE(p + 1));
            p += 3;
          } else if (v <= 246) {
            stack.push(v - 139);
            p++;
          } else if (v <= 250) {
            stack.push((v - 247) * 256 + b[p + 1] + 108);
            p += 2;
          } else if (v <= 254) {
            stack.push(-(v - 251) * 256 - b[p + 1] - 108);
            p += 2;
          } else {
            stack.push(b.readInt32BE(p + 1) / 65536);
            p += 5;
          }
          continue;
        }
        p++;
        switch (v) {
          case 1:
          case 3:
          case 18:
          case 23:
            takeWidth(false);
            stems += stack.length / 2;
            stack.length = 0;
            break;
          case 19:
          case 20:
            takeWidth(false);
            stems += stack.length / 2;
            stack.length = 0;
            p += Math.ceil(stems / 8);
            break;
          case 21:
            takeWidth(false);
            moveTo(stack[0], stack[1]);
            stack.length = 0;
            break;
          case 22:
            takeWidth(true);
            moveTo(stack[0], 0);
            stack.length = 0;
            break;
          case 4:
            takeWidth(true);
            moveTo(0, stack[0]);
            stack.length = 0;
            break;
          case 5:
            for (let i = 0; i < stack.length; i += 2) lineTo(stack[i], stack[i + 1]);
            stack.length = 0;
            break;
          case 6:
          case 7: {
            let horizontal = v === 6;
            for (const d of stack) {
              if (horizontal) lineTo(d, 0);
              else lineTo(0, d);
              horizontal = !horizontal;
            }
            stack.length = 0;
            break;
          }
          case 8:
            for (let i = 0; i + 6 <= stack.length; i += 6) curveTo(...stack.slice(i, i + 6));
            stack.length = 0;
            break;
          case 24: {
            let i = 0;
            for (; i + 6 <= stack.length - 2; i += 6) curveTo(...stack.slice(i, i + 6));
            lineTo(stack[i], stack[i + 1]);
            stack.length = 0;
            break;
          }
          case 25: {
            let i = 0;
            for (; i + 2 <= stack.length - 6; i += 2) lineTo(stack[i], stack[i + 1]);
            curveTo(...stack.slice(i, i + 6));
            stack.length = 0;
            break;
          }
          case 26: {
            let i = 0;
            let dx1 = 0;
            if (stack.length % 2) dx1 = stack[i++];
            for (; i + 4 <= stack.length; i += 4) {
              curveTo(dx1, stack[i], stack[i + 1], stack[i + 2], 0, stack[i + 3]);
              dx1 = 0;
            }
            stack.length = 0;
            break;
          }
          case 27: {
            let i = 0;
            let dy1 = 0;
            if (stack.length % 2) dy1 = stack[i++];
            for (; i + 4 <= stack.length; i += 4) {
              curveTo(stack[i], dy1, stack[i + 1], stack[i + 2], stack[i + 3], 0);
              dy1 = 0;
            }
            stack.length = 0;
            break;
          }
          case 30:
          case 31: {
            let vertical = v === 30;
            for (let i = 0; i + 4 <= stack.length; i += 4) {
              const last = stack.length - i === 5 ? stack[i + 4] : 0;
              if (vertical) curveTo(0, stack[i], stack[i + 1], stack[i + 2], stack[i + 3], last);
              else curveTo(stack[i], 0, stack[i + 1], stack[i + 2], last, stack[i + 3]);
              vertical = !vertical;
            }
            stack.length = 0;
            break;
          }
          case 10:
          case 29: {
            const list = v === 10 ? subrs : gsubrs;
            const index = stack.pop() + subrBias(list.length);
            run(list[index]);
            break;
          }
          case 11:
            return;
          case 14:
            takeWidth(false);
            close();
            stack.length = 0;
            return;
          case 12: {
            const op = b[p++];
            const s = stack;
            if (op === 35) {
              curveTo(...s.slice(0, 6));
              curveTo(...s.slice(6, 12));
            } else if (op === 34) {
              curveTo(s[0], 0, s[1], s[2], s[3], 0);
              curveTo(s[4], 0, s[5], -s[2], s[6], 0);
            } else if (op === 36) {
              curveTo(s[0], s[1], s[2], s[3], s[4], 0);
              curveTo(s[5], 0, s[6], s[7], s[8], -(s[1] + s[3] + s[7]));
            } else if (op === 37) {
              const dx = s[0] + s[2] + s[4] + s[6] + s[8];
              const dy = s[1] + s[3] + s[5] + s[7] + s[9];
              curveTo(...s.slice(0, 6));
              if (Math.abs(dx) > Math.abs(dy)) curveTo(s[6], s[7], s[8], s[9], s[10], -dy);
              else curveTo(s[6], s[7], s[8], s[9], -dx, s[10]);
            }
            stack.length = 0;
            break;
          }
          default:
            stack.length = 0;
        }
      }
    }

    run(charStrings[gid]);
    close();
    return cmds;
  }

  return { unitsPerEm, cmap, advance, outline };
}

/**
 * 글자 한 줄을 SVG 경로로 만든다.
 * runs: [{ text, fill }] 조각들. 자간(tracking, em)은 CSS letter-spacing처럼 글자마다 뒤에 붙는다.
 * 반환하는 width에서는 마지막 글자 뒤 자간을 뺀다 (눈에 보이는 폭 기준 가운데 정렬).
 */
function textPaths(font, runs, { size, x = 0, y, tracking = 0 }) {
  const scale = size / font.unitsPerEm;
  const fmt = (n) => Math.round(n * 100) / 100;
  let pen = 0;
  const parts = [];
  const at = {};
  for (const { text, fill, id } of runs) {
    let d = "";
    for (const ch of text) {
      const gid = font.cmap.get(ch.codePointAt(0)) ?? 0;
      for (const [op, ...pts] of font.outline(gid)) {
        d += op;
        for (let i = 0; i < pts.length; i += 2) d += `${fmt(x + pen + pts[i] * scale)} ${fmt(y - pts[i + 1] * scale)} `;
      }
      pen += font.advance(gid) * scale + tracking * size;
    }
    if (id) at[id] = x + pen;
    parts.push(`<path fill="${fill}" d="${d.trim()}"/>`);
  }
  return { svg: parts.join(""), width: pen - tracking * size, at };
}

const measure = (font, runs, opts) => textPaths(font, runs, { ...opts, y: 0 }).width;

/* ───────────── 공유 이미지 (1200×630) ───────────── */

function shareSvg() {
  const W = 1200;
  const H = 630;
  const extraBold = loadFont("Pretendard-ExtraBold.otf");
  const bold = loadFont("Pretendard-Bold.otf");
  const regular = loadFont("Pretendard-Regular.otf");

  // 글자 로고: Wordmark.tsx와 같은 배치 (ı 바로 뒤 기준점에서 왼쪽 .3em, 기준선 위 .59em, 폭 .42em)
  const wmSize = 128;
  const wmTracking = -0.04;
  const wmRuns = [
    { text: "Fı", fill: NAVY, id: "afterI" },
    { text: "nd", fill: NAVY },
    { text: "Us", fill: BLUE },
  ];
  const wmBaseline = 360;
  const wmWidth = measure(extraBold, wmRuns, { size: wmSize, tracking: wmTracking });
  const wm = textPaths(extraBold, wmRuns, { size: wmSize, x: (W - wmWidth) / 2, y: wmBaseline, tracking: wmTracking });
  const heartScale = (0.42 * wmSize) / 20;
  const heartX = wm.at.afterI - 0.3 * wmSize;
  const heartY = wmBaseline - 0.59 * wmSize - 18 * heartScale;
  const heart = `<path transform="translate(${heartX.toFixed(2)} ${heartY.toFixed(2)}) scale(${heartScale.toFixed(4)})" d="${HEART}" fill="${CORAL}"/>`;

  const line = (font, text, size, fill, baseline, tracking = -0.02) => {
    const runs = [{ text, fill }];
    const width = measure(font, runs, { size, tracking });
    return textPaths(font, runs, { size, x: (W - width) / 2, y: baseline, tracking }).svg;
  };

  const tileSize = 132;
  const tile = `<svg x="${(W - tileSize) / 2}" y="92" width="${tileSize}" height="${tileSize}" viewBox="0 0 72 72">${markSvg().replace(/^<svg[^>]*>|<\/svg>\s*$/g, "")}</svg>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="${SOFT}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g opacity=".5">
    <path transform="translate(-60 380) scale(14) rotate(-12 10 9)" d="${HEART}" fill="${SOFT}"/>
    <path transform="translate(1000 -40) scale(11) rotate(14 10 9)" d="${HEART}" fill="${SOFT}"/>
  </g>
  <g filter="drop-shadow(0 8px 20px rgba(23,59,112,.14))">${tile}</g>
  ${wm.svg}${heart}
  ${line(bold, "장기 실종아동 찾기 · AI 예상 모습 비교", 42, INK, 456)}
  ${line(regular, "실종 당시 사진과 AI가 예측한 현재 모습을 비교하세요", 27, MUTED, 512, -0.01)}
  <rect y="${H - 12}" width="${W * 0.82}" height="12" fill="${NAVY}"/>
  <rect x="${W * 0.82}" y="${H - 12}" width="${W * 0.12}" height="12" fill="${BLUE}"/>
  <rect x="${W * 0.94}" y="${H - 12}" width="${W * 0.06}" height="12" fill="${CORAL}"/>
</svg>`;
}

/* ───────────── 쓰기 ───────────── */

function write(path, data) {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, data);
  console.log(`  ${path} (${data.length.toLocaleString()} bytes)`);
}

console.log("FindUs 브랜드 이미지 생성");
write("app/icon.svg", markSvg());
write("app/favicon.ico", ico([
  { size: 16, data: await png(markSvg16(), 16) },
  { size: 32, data: await png(markSvg(), 32) },
]));
write("app/apple-icon.png", await png(markSvg({ fullBleed: true }), 180));
write("public/icons/icon-192.png", await png(markSvg(), 192));
write("public/icons/icon-512.png", await png(markSvg(), 512));
write("public/icons/icon-maskable-512.png", await png(markSvg({ fullBleed: true, artScale: 0.8 }), 512));
write("public/images/findus-share.png", await sharp(Buffer.from(shareSvg())).png({ compressionLevel: 9 }).toBuffer());
