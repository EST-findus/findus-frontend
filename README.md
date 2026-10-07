# findus-frontend

실종자 검색 서비스 **findus**의 프론트엔드입니다.

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- 테스트: vitest

> 현재 실종자 목록은 `lib/data.ts`의 **목업 데이터**를 사용합니다.
> 그래서 백엔드 서버가 없어도 화면은 정상적으로 뜹니다. 백엔드 연결은 헤더의 헬스 체크 버튼으로만 확인합니다.

---

## 1. 준비물

| 도구 | 버전 | 확인 명령어 |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | **20 이상** (LTS 권장) | `node -v` |
| npm | Node.js에 포함 | `npm -v` |
| [Git](https://git-scm.com/) | 아무 버전 | `git --version` |

Node.js가 없다면 [nodejs.org](https://nodejs.org/)에서 **LTS** 버전을 설치하세요. 설치 후 터미널을 새로 열어야 `node` 명령어가 인식됩니다.

---

## 2. 처음 실행하기

### ① 저장소 받기

```bash
git clone https://github.com/EST-findus/findus-frontend.git
cd findus-frontend
```

### ② 패키지 설치

```bash
npm install
```

처음 한 번만 하면 됩니다. 나중에 `git pull`로 받은 코드에서 `package.json`이 바뀌었다면 다시 실행하세요.

### ③ 환경 변수 파일 만들기

`.env.example`을 복사해서 `.env` 파일을 만듭니다.

```bash
# macOS / Linux / Git Bash
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

`.env` 내용은 다음과 같습니다. 백엔드를 다른 주소에서 띄웠다면 이 값을 바꾸세요.

```env
BACKEND_URL=http://localhost:18080
```

> `.env`는 Git에 올라가지 않습니다 (`.gitignore`에 포함). 각자 자기 PC에서 만들어 주세요.
> `.env` 파일이 없어도 기본값 `http://localhost:18080`으로 동작합니다.

### ④ 개발 서버 실행

```bash
npm run dev
```

터미널에 `Ready`가 뜨면 브라우저에서 **http://localhost:3000** 을 열면 됩니다.
코드를 저장하면 화면이 자동으로 새로고침됩니다. 서버를 끄려면 터미널에서 `Ctrl + C`를 누르세요.

---

## 3. 백엔드와 연결하기 (선택)

브라우저에서 백엔드를 직접 호출하면 CORS 때문에 막히기 때문에, 프론트엔드는 **`/backend/*` 경로로 요청하고 Next.js가 이를 백엔드로 전달(프록시)** 합니다.

```
브라우저 → http://localhost:3000/backend/health
          → (Next.js 프록시) → http://localhost:18080/health
```

1. 백엔드 서버를 `18080` 포트로 실행합니다 (다른 포트라면 `.env`의 `BACKEND_URL` 수정).
2. 프론트엔드 개발 서버를 실행합니다. **`.env`를 바꿨다면 개발 서버를 껐다가 다시 켜야 반영됩니다.**
3. 화면 상단의 헬스 체크 버튼을 눌러 연결을 확인합니다.

---

## 4. 명령어 모음

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 (http://localhost:3000) |
| `npm run lint` | ESLint 코드 검사 |
| `npm run typecheck` | TypeScript 타입 검사 |
| `npm test` | 테스트 실행 (vitest) |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 빌드 결과 실행 (`build` 후 사용) |
| `npm run deploy:preview` | Vercel 미리보기(Preview) 배포 |
| `npm run deploy` | Vercel 운영(Production) 배포 |

**커밋 전에 `lint`, `typecheck`, `test`가 모두 통과해야 합니다.**

```bash
npm run lint && npm run typecheck && npm test
```

---

## 5. 배포하기 (Vercel)

`main` 브랜치에 push하면 Vercel이 자동으로 운영 배포하고, PR마다 미리보기 배포가 만들어집니다.
직접 배포하고 싶을 때만 아래처럼 CLI를 사용하세요. Vercel CLI는 devDependency로 설치되어 있어 `npm install`만 하면 됩니다.

### 처음 한 번만

```bash
npx vercel login      # 브라우저로 Vercel 계정 로그인
npm run vercel:link   # 이 폴더를 Vercel 프로젝트와 연결 (.vercel/ 폴더 생성, Git에 올라가지 않음)
npm run vercel:env    # (선택) Vercel 환경 변수를 .env.local로 내려받기
```

### 배포

```bash
npm run deploy:preview  # 미리보기 배포 → 임시 URL 발급
npm run deploy          # 운영 배포
```

### 환경 변수

Vercel 대시보드의 **Settings → Environment Variables**에 `BACKEND_URL`을 등록합니다.

```env
BACKEND_URL=https://<배포된 백엔드 주소>
```

> `BACKEND_URL`은 **빌드할 때** 프록시 설정에 고정됩니다. 값을 바꿨다면 반드시 **Redeploy** 해야 반영됩니다.
> 백엔드는 인터넷에서 접근 가능한 주소여야 합니다 (`localhost`는 Vercel에서 접근할 수 없음).

### 아이콘과 공유 이미지

- `public/images/findus-logo.png`: 원본 로고 및 헤더 아이콘
- `app/favicon.ico`, `app/icon.png`: 브라우저 탭 아이콘
- `app/apple-icon.png`: iOS 홈 화면 아이콘 (180×180)
- `public/images/findus-share.png`: 카카오톡 링크 미리보기 및 Open Graph·Twitter 공유 이미지 (1200×630)

로고를 교체한 뒤 `npm run generate:brand`를 실행하면 아이콘과 공유 이미지가 다시 생성됩니다.
생성된 이미지도 함께 저장소에 반영해야 합니다.

공유 이미지의 절대 주소는 `NEXT_PUBLIC_SITE_URL`을 기준으로 생성합니다.
커스텀 도메인을 쓰거나 Vercel 외 환경에 배포한다면 프로토콜을 포함한 운영 주소를 설정하세요.

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

미설정 시 Vercel 운영 도메인(`VERCEL_PROJECT_PRODUCTION_URL`), 배포 주소(`VERCEL_URL`),
`http://localhost:3000` 순서로 사용합니다. 주소를 변경하면 다시 빌드·배포해야 합니다.
이미지가 이미 공유된 적 있다면 [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서
해당 URL의 미리보기 캐시를 초기화한 뒤 확인하세요.

---

## 6. 폴더 구조

```
app/          # 페이지와 레이아웃 (App Router)
components/   # 화면 컴포넌트
lib/          # 데이터(목업), 필터, 포맷 함수, 타입
  data.ts     #   데이터 접근은 이 파일에서만 → 백엔드 연동 시 여기만 수정
next.config.ts  # /backend/* 프록시 설정
```

---

## 7. 자주 겪는 문제

**`npm` 또는 `node`를 찾을 수 없다고 나와요**
→ Node.js를 설치한 뒤 터미널(VS Code 포함)을 완전히 껐다가 다시 여세요.

**`Port 3000 is in use` 라고 나와요**
→ 이미 다른 개발 서버가 켜져 있습니다. 그 터미널을 종료하거나, 다른 포트로 실행하세요.

```bash
npm run dev -- -p 3001
```

**헬스 체크가 실패해요**
→ 백엔드 서버가 켜져 있는지, `.env`의 `BACKEND_URL` 포트가 맞는지 확인하고 개발 서버를 재시작하세요.

**`git pull` 후 실행이 안 돼요**
→ 의존성이 바뀌었을 수 있습니다. `npm install`을 다시 실행하세요.
그래도 안 되면 `node_modules`와 `.next` 폴더를 지우고 `npm install`부터 다시 해 보세요.

---

## 8. 커밋 규칙

`<type>: <한글 요약>` 형식(Conventional Commits)을 따릅니다. 자세한 규칙은 [AGENTS.md](AGENTS.md)를 참고하세요.

```
feat: 실종자 상세 모달 추가
fix: 검색어 공백 처리 오류 수정
```

| type | 용도 |
| --- | --- |
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `refactor` | 동작 변화 없는 구조 개선 |
| `style` | 포맷팅, 스타일(CSS) 변경 |
| `test` | 테스트 추가/수정 |
| `docs` | 문서 |
| `chore` | 설정, 의존성, 빌드 등 기타 |

`.env`처럼 비밀 값이 담긴 파일은 절대 커밋하지 마세요 (`.env.example`만 허용).

안녕
