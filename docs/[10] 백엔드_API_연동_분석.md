# [10] 백엔드 API 연동 분석

백엔드(`findus/backend`, Spring Boot 4.1 · `dev` 기준)의 컨트롤러·DTO·보안 설정을 읽고, 프론트에서 연결해야 할 부분을 정리했습니다.

- 기준 코드: `backend/src/main/java/com/findus/backend/**/controller`, `dto`, `auth/config/SecurityConfig.java`, `application*.yml`, `README.md`
- 프론트 호출 경로: 브라우저 → `/backend/*` (Next 프록시, `next.config.ts`) → `BACKEND_URL` (기본 `http://localhost:18080`)
- 서버 컴포넌트는 `BACKEND_URL`로 직접 호출합니다 (`lib/missingApi.ts`).

---

## 1. 한눈에 보기

| 영역 | 백엔드 API | 프론트 현재 상태 | 연결할 파일 | 우선순위 |
| --- | --- | --- | --- | --- |
| 실종아동 목록·상세·사진 | `GET /api/missing-persons`, `/{id}`, `/{id}/images/{imageId}` | **연결 완료** | `lib/missingApi.ts` | - |
| 서버 상태 | `GET /health` | **연결 완료** | `components/HealthCheckButton.tsx` | - |
| 회원가입 | `POST /api/members` | localStorage 목업 | `lib/auth.ts` | 높음 |
| 로그인·재발급·로그아웃 | `/api/auth/csrf`, `login`, `refresh`, `logout` | localStorage 목업 | `lib/auth.ts`, `lib/useCurrentUser.ts` | 높음 |
| 내 정보 | `GET /api/members/me` | 세션 객체를 그대로 사용 | `lib/auth.ts`, `components/MyPage.tsx` | 높음 |
| 관심아동 | `PUT/DELETE/GET /api/members/me/favorites` | localStorage 목업 | `lib/favorites.ts`, `lib/useFavorites.ts` | 중간 |
| 게시글(정보 마당) | `GET/POST/PUT/DELETE /api/posts` | 목업 글 + localStorage | `lib/community.ts` | 중간 |
| 댓글 | `/api/posts/{postId}/comments` | 목업 + localStorage | `lib/community.ts` | 중간 |
| AI 나이 변환 | `POST /api/aging` (multipart) | 목업 화면 (`/age-lab`) | `app/age-lab/page.tsx` | 낮음 (로컬 전용) |
| 펀딩·가족 인증·주소록·문의 | **백엔드 API 없음** | 목업 / Next Route | - | 해당 없음 |

연결 대상이 아닌 API: `/api/admin/missing-sync`(배치), `/api/dev/dummy-data`(더미), `/api/local/aiworkbench/*`(Python 작업 화면 전용, 브라우저 요청은 403), `/test/*`(로컬 확인 화면).

---

## 2. 공통 규칙

### 2.1 인증 방식

- **Access Token**: 로그인·재발급 응답 본문의 `accessToken`. 유효 15분(`expiresIn: 900`). **메모리에만 보관**하고 `Authorization: Bearer <token>`으로 보냅니다.
- **Refresh Token**: `findus_refresh` HttpOnly 쿠키, 유효 7일, `SameSite=Lax`, `Path=/api/auth`. 재발급할 때마다 교체됩니다.
- **CSRF**: `GET /api/auth/csrf` → `{ token, headerName }` 응답과 `XSRF-TOKEN` 쿠키. 아래 쓰기 요청에는 `[headerName]: token` 헤더(`X-XSRF-TOKEN`)가 필요합니다.
  - 로그인·재발급·로그아웃
  - 게시글·댓글 작성/수정/삭제
  - 관심아동 등록/취소
  - AI 나이 변환
  - **예외**: 회원가입(`POST /api/members`)은 CSRF 불필요
- 모든 인증 관련 요청은 `credentials: "include"`를 사용합니다 (같은 오리진 프록시라 `same-origin` 기본값으로도 쿠키는 전송되지만 명시 권장).

### 2.2 공개/보호 API

| 공개 (토큰 불필요) | 보호 (JWT 필요) |
| --- | --- |
| `POST /api/members`, `POST /api/auth/*`, `GET /api/auth/csrf`, `GET /health` | `GET /api/members/me` |
| `GET /api/posts`, `/api/posts/{id}`, `/api/posts/{id}/comments` | 게시글·댓글 `POST/PUT/DELETE` |
| `GET /api/missing-persons`, `/{id}`, `/{id}/images/{imageId}` | `/api/members/me/favorites/**` |
| `POST /api/aging` (**local 프로필만**, 배포 시 로그인 필요로 바뀔 예정) | |

> ⚠️ `JwtAuthenticationFilter`는 `Authorization` 헤더가 **있는데 만료/무효**면 공개 API에서도 즉시 401을 반환합니다. 공개 GET에는 토큰을 붙이지 않거나, 401이면 재발급 후 재시도하도록 합니다.

### 2.3 오류 응답

```ts
interface ApiError {
  code: string;      // INVALID_REQUEST, UNAUTHORIZED, FORBIDDEN, AUTH_UNAVAILABLE, AI_BUSY, AI_UNAVAILABLE, INVALID_IMAGE ...
  message: string;   // 사용자에게 보여줄 수 있는 한글 안내
  errors: { field: string; message: string }[]; // 입력 항목별 오류 (검증 실패 시)
}
```

| 상태 | 의미 | 프론트 처리 |
| --- | --- | --- |
| 400 | 입력 형식·정렬·UUID 오류 | `errors[]`를 폼 필드 옆에 표시, 없으면 `message` |
| 401 | 로그인 필요 / 토큰 만료 | 재발급 1회 → 실패 시 로그인 화면(`/login?next=...`) |
| 403 | 작성자 아님 또는 CSRF 실패 | CSRF 재발급 후 1회 재시도, 그래도 403이면 권한 없음 안내 |
| 404 | 없음·삭제됨 | not-found 처리 |
| 409 | 이메일 중복 | "이미 가입된 이메일" 안내 |
| 503 | 인증 저장소·AI 서버 연결 실패 | 잠시 후 다시 시도 안내 |

### 2.4 페이지 응답

게시글·댓글·관심아동은 같은 형식입니다. **첫 페이지는 0**, 기본 10개, 최대 100개, `sort=필드,asc|desc`.

```ts
interface Page<T> {
  content: T[]; page: number; size: number;
  totalElements: number; totalPages: number;
  hasNext: boolean; hasPrevious: boolean;
}
```

실종자 목록(`MissingPageResponse`)만 `hasNext`/`hasPrevious`가 없습니다.

### 2.5 시간 형식

게시글·댓글·관심아동의 `createdAt`/`updatedAt`/`savedAt`은 **UTC `LocalDateTime`이며 시간대 표기가 없습니다** (예: `"2026-10-22T03:15:00.123456"`). 그대로 `new Date()`에 넣으면 로컬 시간으로 해석되므로 `Z`를 붙여 파싱한 뒤 KST로 표시해야 합니다. 현재 `lib/community.ts`의 `formatPostDate`는 KST ISO 문자열 슬라이싱 방식이라 변환 함수가 필요합니다.

---

## 3. 🚨 연결 전에 해결해야 할 문제

### 3.1 Refresh 쿠키 경로와 프록시 경로 불일치 (차단 이슈)

- 백엔드는 Refresh 쿠키를 `Path=/api/auth`로 내려줍니다.
- 브라우저 입장에서 요청 주소는 `http://localhost:3000/backend/api/auth/refresh`이므로 경로가 `/backend/api/auth`입니다.
- 쿠키 경로 `/api/auth`와 맞지 않아 **재발급·로그아웃 요청에 Refresh 쿠키가 전송되지 않습니다** → 새로고침하면 로그인이 풀리고, 로그아웃해도 서버 세션이 차단되지 않습니다.

해결 방법 (택1):

1. **프론트**: `next.config.ts`에 인증 경로 전용 rewrite를 추가하고 인증 호출만 `/api/auth/*`로 보냅니다. `app/api/inquiry`와 경로가 겹치지 않으므로 충돌하지 않습니다.
   ```ts
   async rewrites() {
     return [
       { source: "/api/auth/:path*", destination: `${BACKEND_URL}/api/auth/:path*` },
       { source: "/backend/:path*", destination: `${BACKEND_URL}/:path*` },
     ];
   }
   ```
2. **백엔드**: 쿠키 `path`를 `/`로 변경 (백엔드 팀 협의 필요).

→ 프론트만으로 해결 가능한 1번을 권장합니다.

### 3.2 CORS 허용 오리진

- 백엔드 기본 `FRONTEND_ORIGIN`은 `http://localhost:5173`(Vite 기준)입니다. Next 개발 서버는 `http://localhost:3000`입니다.
- 같은 오리진 프록시를 거쳐도 브라우저는 POST/PUT/DELETE에 `Origin: http://localhost:3000` 헤더를 붙이고, 백엔드가 받는 Host는 `localhost:18080`이므로 Spring CORS 필터가 교차 출처로 판단해 **403**을 반환합니다.
- **백엔드 `.env`에 `FRONTEND_ORIGIN=http://localhost:3000`을 설정**해야 합니다. 배포 시에도 실제 프론트 도메인을 넣어야 합니다. (허용 헤더는 `Content-Type`, `Authorization`, `X-XSRF-TOKEN`만입니다.)

### 3.3 쿠키 Secure 설정

`application.yml` 기본값은 `AUTH_COOKIE_SECURE=true`이고 `local` 프로필만 `false`입니다. HTTP로 띄운 스테이징 등에서는 쿠키가 저장되지 않으니 HTTPS 또는 `false` 설정을 확인합니다.

### 3.4 프론트 검증 규칙과 백엔드 규칙 차이

| 항목 | 프론트 현재 (`lib/auth.ts`, `lib/community.ts`) | 백엔드 | 조정 |
| --- | --- | --- | --- |
| 비밀번호 | 8~64자, 영문+숫자 필수 | 8자 이상, UTF-8 72바이트 이하, 공백만 불가 | 프론트 규칙이 더 엄격 → 유지 가능. 72바이트 검사 추가 권장 |
| 닉네임 | 2~12자, 중복 불가 | 1~50자, **중복 검사 없음** | 프론트 "이미 사용 중인 닉네임" 오류 제거 |
| 이름(`name`) | **입력 없음** | **필수**, 최대 100자 | 회원가입 폼에 이름 필드 추가 필요 |
| 게시글 제목 | 2~60자 | 1~200자 | 프론트 제한 유지 가능 |
| 게시글 본문 | 5~3000자 | 1~10000자 | 프론트 제한 유지 가능 |
| 댓글 | 1~500자 | 1~1000자 | 프론트 제한 유지 가능 |
| 작성자 이름 입력 | 글·댓글마다 `author` 입력 | 로그인 회원 닉네임 자동 | 입력 필드 제거, 로그인 필수로 변경 |

### 3.5 백엔드에 없는 프론트 기능

연결 시 아래 기능은 **백엔드 데이터가 없어 동작이 바뀝니다.** 유지할지, 백엔드에 요청할지 결정이 필요합니다.

- 게시글 **분류**(`notice`/`info`/`story`/`question`)와 분류 탭 — `Post`에 category 필드 없음
- 게시글 **조회수**(`views`) — 없음
- 게시글 **검색** — 목록 API에 검색 파라미터 없음 (현재 프론트는 전체를 받아 클라이언트 필터)
- 목록의 **댓글 수** — `PostSummaryResponse`에 없음
- 공지 상단 고정 — 분류가 없으므로 불가
- 관심아동의 **"내 아이"(`ownChildId`)** 표시 — 백엔드에 없음 (localStorage로 유지 가능)
- 회원 **가입일**(`createdAt`) — `MemberInfoResponse`에 없음
- 실종아동의 **AI 예상 얼굴**(`photos.aged`, `styles`) — DB에 `missing_person_ai_images` 테이블은 있지만 **공개 응답에 포함되지 않음**

---

## 4. 영역별 연결 상세

### 4.1 회원가입 — `POST /api/members`

```ts
// 요청 (CSRF 불필요)
{ email: string; password: string; name: string; nickname: string }
// 201 응답
{ id: string; email: string; name: string; nickname: string }
```

- 이메일은 서버에서 trim + 소문자 변환. 409면 이메일 중복.
- **가입 후 자동 로그인되지 않습니다.** 현재 목업은 가입 즉시 세션을 만들므로, 가입 성공 후 바로 `login()`을 호출하도록 바꿉니다.

### 4.2 로그인·세션 — `/api/auth/*`

```ts
GET  /api/auth/csrf     → { token: string; headerName: string }
POST /api/auth/login    body { email, password } → { accessToken, tokenType: "Bearer", expiresIn: 900 } + Set-Cookie findus_refresh
POST /api/auth/refresh  (쿠키 자동 전송)        → 같은 TokenResponse, 쿠키 교체
POST /api/auth/logout                            → 204, 쿠키 삭제
```

권장 흐름 (`lib/auth.ts`의 "저장소" 영역 교체):

1. 앱 시작 시: `csrf()` → `refresh()` 시도 → 성공하면 `GET /api/members/me`로 사용자 로드, 401이면 비로그인 상태.
2. 로그인: `csrf()` → `login()` → `me()` → 상태 갱신 (`CHANGE_EVENT` 발행은 그대로 활용).
3. API 호출 중 401: `refresh()` **한 번만**(동시 호출 시 Promise 공유) → 원 요청 재시도 → 실패 시 로그아웃 처리.
4. 로그아웃: `csrf()` → `logout()` → 메모리 토큰 삭제.
5. 만료 1분 전 미리 재발급(`expiresIn` 기준)하면 401 왕복을 줄일 수 있습니다.

`useCurrentUser`는 `useSyncExternalStore` 구조를 유지하되, 스냅샷 출처를 localStorage 대신 메모리 스토어로 바꿉니다. 다른 탭 동기화가 필요하면 `BroadcastChannel`을 씁니다 (토큰 자체를 localStorage에 저장하지 않습니다).

### 4.3 내 정보 — `GET /api/members/me`

```ts
{ id: string; email: string; name: string; nickname: string; role: "USER" | "ADMIN"; status: "ACTIVE" | "INACTIVE" }
```

현재 `User` 타입(`id, email, nickname, createdAt`)에서 `createdAt`을 제거하거나 optional로 바꾸고 `name`, `role`을 추가합니다. 닉네임·비밀번호 변경, 회원 탈퇴 API는 **아직 없습니다** (`components/AccountSettings.tsx` 기능은 목업 유지).

### 4.4 관심아동 — `/api/members/me/favorites`

```ts
PUT    /api/members/me/favorites/{missingPersonId}   → 200 FavoriteResponse (반복 등록해도 같은 행)
DELETE /api/members/me/favorites/{missingPersonId}   → 204 (반복 취소도 204)
GET    /api/members/me/favorites?page=0&size=100     → Page<FavoriteResponse>

interface FavoriteResponse {
  id: string;                 // 관심 등록 UUID (URL에 쓰지 않음)
  missingPersonId: string;    // 실종자 UUID — 등록·취소 URL에 사용
  savedAt: string;            // UTC, 최초 등록 시각 (재등록해도 유지)
  availability: "AVAILABLE" | "UNAVAILABLE" | "NOT_CHILD";
  child: MissingPersonDto | null; // AVAILABLE일 때만
}
```

- `missingPersonId`는 `MissingPerson.id`(DB UUID)입니다. 경찰청 `sourceId`가 아닙니다.
- 모두 JWT 필요, PUT/DELETE는 CSRF 필요.
- `child`는 실종자 DTO와 같은 형식이므로 `toMissingPerson()`을 재사용합니다.
- `UNAVAILABLE`/`NOT_CHILD`는 개인정보 없이 "공개 중단된 아동" 카드 + 취소 버튼만 표시합니다 (`components/FavoriteChildren.tsx`).
- `toggleFavorite`은 낙관적 업데이트 후 실패 시 롤백하는 방식이 자연스럽습니다. `ownChildId`는 백엔드에 없으므로 localStorage에 남깁니다.

### 4.5 게시글 — `/api/posts`

```ts
GET    /api/posts?page=0&size=10&sort=createdAt,desc → Page<PostSummary>  // 본문 없음
GET    /api/posts/{id}                               → PostResponse
POST   /api/posts         body { title, content }    → 201 PostResponse (+ Location)
PUT    /api/posts/{id}    body { title, content }    → 200 PostResponse (둘 다 필수)
DELETE /api/posts/{id}                               → 204

interface PostSummary { id: string; title: string; author: { id: string; nickname: string }; createdAt: string; updatedAt: string }
interface PostResponse extends PostSummary { content: string }
```

- `sort` 허용: `createdAt`, `updatedAt`, `title`, `id`
- 수정·삭제는 작성자만 (`author.id === me.id`일 때 버튼 노출). 탈퇴 회원 닉네임은 `"탈퇴한 회원"`.
- 게시글 ID가 UUID로 바뀌므로 `app/community/[id]` 라우트에서 UUID 검증 후 호출합니다 (잘못된 형식은 400).
- 본문은 일반 텍스트 — `dangerouslySetInnerHTML` 금지, `white-space: pre-wrap`으로 표시.
- 페이지 번호: 프론트 `paginate()`는 1부터, 백엔드는 0부터.
- 목록 페이지는 서버 페이지네이션으로 전환하거나, 분류·검색 기능을 유지하려면 3.5절 결정이 먼저 필요합니다.

### 4.6 댓글 — `/api/posts/{postId}/comments`

```ts
GET    ...?page=0&size=10   → Page<CommentResponse>  // 기본 작성순 오름차순
POST   body { content }     → 201 CommentResponse
PUT    /{commentId} body { content } → 200
DELETE /{commentId}         → 204

interface CommentResponse { id: string; postId: string; content: string; author: { id: string; nickname: string }; createdAt: string; updatedAt: string }
```

- 현재 프론트 `Post.comments`는 글에 포함된 배열이지만, 백엔드는 **별도 페이지 API**입니다. 상세 화면(`components/PostDetail.tsx`)에서 따로 불러오도록 분리합니다.
- 수정·삭제 UI는 현재 없음 → 필요 시 추가.

### 4.7 실종아동 — 이미 연결됨 (점검 사항)

`lib/missingApi.ts`가 서버에서 전체 목록(100개씩 전체 페이지)을 받아 `MissingPerson`으로 변환합니다.

- 목록은 **실종 1년 이상**·공개 중·분류 `010`만, 원본 발생일 내림차순.
- 이미지 `url`은 백엔드 상대 경로(`/api/missing-persons/{id}/images/{imageId}`) → 프론트에서 `/backend` 접두사를 붙여 사용 (구현됨). `photoUrl`(경찰청 원본 주소일 수 있음)은 사용하지 않음 (구현됨).
- 사진 응답은 `Cache-Control: no-store`이므로 `next/image` 최적화 캐시를 기대할 수 없습니다.
- 상세 404가 401로 나오는 경우를 목록 대조로 우회하고 있음 (`fetchMissingPerson`). 백엔드에서 `/error` 경로를 공개하면 제거 가능 → 백엔드 팀에 전달할 항목.
- `missingDate`는 `occurrenceDate`가 `YYYYMMDD`일 때만 파싱됩니다.

### 4.8 AI 나이 변환 — `POST /api/aging` (로컬 전용)

```ts
// multipart/form-data
image: File        // JPG/PNG, 10MB 이하
ages:  "20,30,40"  // 쉼표 구분, 최대 5개
sex:   "M" | "F"
// 200
{ resultId: string; sex: string; seconds: number; colorized: boolean;
  images: { key: string; age: number; dataUrl: string }[] } // 1024x1024 PNG data URL
```

- CSRF 필요. local 프로필에서만 비회원 허용 — **배포 시 로그인 필요로 바뀔 예정**.
- GPU 대기 포함 최대 5분 걸릴 수 있음 → 진행 표시와 긴 타임아웃 필요. Next 프록시의 기본 타임아웃도 확인 필요.
- 결과는 저장되지 않으며 `no-store` 응답 → 화면 이탈 시 사라진다는 안내 필요.
- 오류: 400(사진·나이·성별 오류, 얼굴 미검출), 503(`AI_UNAVAILABLE`, `AI_BUSY`).
- `app/age-lab/page.tsx`는 "준비 중" 목업이며 학습 동의·의견 저장 API는 백엔드에 없습니다.

---

## 5. 작업 순서 제안

1. **기반**: 3.1 rewrite 추가, 백엔드 `FRONTEND_ORIGIN=http://localhost:3000` 설정, `lib/apiClient.ts`(CSRF·토큰·401 재발급·`ApiError` 파싱 공통 함수) 작성
2. **인증**: 회원가입(이름 필드 추가) → 로그인 → 새로고침 시 재발급 → 로그아웃 → 내 정보
3. **관심아동**: `lib/favorites.ts` 저장소 교체, 공개 중단 아동 표시
4. **정보 마당**: 3.5절의 분류·조회수·검색 처리 방향 결정 → 게시글 → 댓글
5. **AI 나이 변환**: 배포 정책(로그인·동의) 확정 후

각 단계마다 `lib/*.test.ts`의 목업 기반 테스트를 `fetch` 모킹 방식으로 바꿉니다.

## 6. 백엔드 팀에 확인·요청할 것

- Refresh 쿠키 경로(`/api/auth`) 유지 여부 — 프론트 rewrite로 맞출 예정
- 배포 환경 `FRONTEND_ORIGIN` 값
- 게시글 분류·조회수·검색·댓글 수 필드 추가 여부
- 회원 가입일·닉네임 변경·비밀번호 변경·탈퇴 API 계획
- 실종아동 AI 예상 얼굴(`missing_person_ai_images`) 공개 API 계획
- 상세 404가 401로 바뀌는 `/error` 보안 처리
- `/api/aging`의 배포 시 인증 정책
