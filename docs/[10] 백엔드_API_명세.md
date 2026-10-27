# [10] 백엔드 API 명세 (프론트 연동용)

`findus-backend`(Spring Boot, `dev` 브랜치 `ff773c3` 기준) 코드에서 직접 정리한 API 명세입니다.
프론트의 목업(localStorage) 기능을 실제 API로 바꿀 때 이 문서만 보고 구현할 수 있도록 요청·응답 타입, 오류, 주의점을 함께 적었습니다.

> 근거 코드: `backend/src/main/java/com/findus/backend/*/controller`, `*/dto`, `auth/config/SecurityConfig.java`, `common/exception/ApiExceptionHandler.java`
> 백엔드가 바뀌면 Swagger(`http://localhost:18080/swagger-ui/index.html`, local 프로필)로 최신 내용을 확인하세요.

---

## 0. 한눈에 보기

| 영역 | 메서드·경로 | 인증 | CSRF | 프론트 대상 |
| --- | --- | --- | --- | --- |
| 인증 | `GET /api/auth/csrf` | - | - | `lib/auth.ts` |
| | `POST /api/auth/login` | - | 필요 | `lib/auth.ts` |
| | `POST /api/auth/refresh` | Refresh 쿠키 | 필요 | `lib/auth.ts` |
| | `POST /api/auth/logout` | Refresh 쿠키 | 필요 | `lib/auth.ts` |
| 회원 | `POST /api/members` | - | 불필요 | 회원가입 |
| | `GET /api/members/me` | JWT | - | `useCurrentUser` |
| 실종아동 | `GET /api/missing-persons` | - | - | `lib/missingApi.ts` (연동됨) |
| | `GET /api/missing-persons/{id}` | - | - | 상세 |
| | `GET /api/missing-persons/{personId}/images/{imageId}` | - | - | `<img src>` |
| AI 이미지 | `GET /api/missing-persons/{personId}/ai-image` | - | - | AI 예상 모습·스타일 버튼 |
| | `GET /api/missing-persons/{personId}/ai-image/photo?style=` | - | - | `<img src>` |
| 관심아동 | `GET /api/members/me/favorites` | JWT | - | `lib/favorites.ts` |
| | `PUT /api/members/me/favorites/{missingPersonId}` | JWT | 필요 | 관심 등록 |
| | `DELETE /api/members/me/favorites/{missingPersonId}` | JWT | 필요 | 관심 취소 |
| 게시글 | `GET /api/posts` · `GET /api/posts/{id}` | - | - | `lib/community.ts` |
| | `POST /api/posts` · `PUT/DELETE /api/posts/{id}` | JWT | 필요 | 글쓰기·수정·삭제 |
| 댓글 | `GET /api/posts/{postId}/comments` | - | - | `lib/community.ts` |
| | `POST` · `PUT/DELETE .../comments/{commentId}` | JWT | 필요 | 댓글 쓰기·수정·삭제 |
| 뉴스 | `GET /api/news?placement=HOME\|MYPAGE` | - | - | 홈·마이페이지 기사 |
| 문의 | `POST /api/inquiries` | 선택 | 불필요 | `components/InquiryForm.tsx` |
| 상태 | `GET /health` | - | - | `HealthCheckButton` |
| 관리자 | `/api/admin/**` | JWT(ADMIN) | 쓰기 필요 | (관리자 화면, 부록 A) |

---

## 1. 공통 규칙

### 1.1 호출 주소

- 브라우저에서는 **반드시 `/backend` 접두사**로 호출합니다. `next.config.ts`가 `/backend/:path*` → `BACKEND_URL/:path*`로 프록시하므로 같은 오리진이 되어 CORS가 필요 없습니다.
  - 예: `GET /api/posts` → `fetch('/backend/api/posts')`
- 서버 컴포넌트·Route Handler에서는 `process.env.BACKEND_URL`로 직접 호출합니다 (`lib/missingApi.ts`의 `request()` 참고).
- 응답 본문의 이미지 `url`(예: `/api/missing-persons/{id}/images/{imageId}`)은 **백엔드 기준 상대 경로**입니다. 화면에서는 앞에 `/backend`를 붙입니다.

### 1.2 인증 (JWT + Refresh 쿠키)

| 항목 | 값 |
| --- | --- |
| Access Token | 응답 본문 `accessToken`, 유효 **15분**(`expiresIn: 900`초). **메모리에만 보관** (localStorage 금지) |
| 전송 방식 | `Authorization: Bearer <accessToken>` |
| Refresh Token | HttpOnly 쿠키 `findus_refresh`, 유효 **7일**, `SameSite=Lax`, `Path=/api/auth` |
| 재발급 | `POST /api/auth/refresh` 때마다 Refresh Token이 **교체(rotation)** 됨 |
| 로그아웃 | 해당 로그인 세션을 서버에서 즉시 차단 → 같은 세션의 Access Token도 바로 401 |

- 토큰이 무효·만료·세션 차단·회원 비활성이면 **401 `UNAUTHORIZED`** + `WWW-Authenticate: Bearer`.
- 예외: `POST /api/inquiries`는 토큰이 무효해도 401 없이 비회원으로 처리합니다.
- Redis 장애 시 인증 요청은 **503 `AUTH_UNAVAILABLE`**.

> ⚠️ **Refresh 쿠키 경로 주의 (구현 전 반드시 해결)**
> 쿠키 `Path=/api/auth`인데 브라우저는 `/backend/api/auth/...`로 호출하므로, 브라우저가 이 쿠키를 **refresh·logout 요청에 보내지 않습니다.** 둘 중 하나를 선택하세요.
> 1. (권장, 프론트만 수정) `next.config.ts`의 `rewrites()`에 `{ source: "/api/auth/:path*", destination: \`${BACKEND_URL}/api/auth/:path*\` }`를 추가하고, 인증 API만 `/api/auth/...`(접두사 없이)로 호출. `app/api/auth` Route Handler를 만들지 않도록 주의.
> 2. 백엔드 `AuthController.cookie()`의 `.path("/api/auth")`를 `"/"`로 변경 요청.

### 1.3 CSRF

쿠키 기반 요청을 보호하기 위해 **GET이 아닌 요청(POST·PUT·DELETE)은 CSRF 헤더가 필요**합니다. 예외: `POST /api/members`(회원가입), `POST /api/inquiries`(문의).

1. `GET /api/auth/csrf` → `{ "token": "...", "headerName": "X-XSRF-TOKEN" }` + `XSRF-TOKEN` 쿠키(Path `/`, HttpOnly 아님)가 설정됨
2. 이후 쓰기 요청에 `[headerName]: token` 헤더 추가, `credentials: 'include'`
3. 토큰 값은 쿠키 `XSRF-TOKEN`과 같으므로 `document.cookie`에서 읽어도 됩니다. 쿠키가 없을 때만 `/csrf`를 호출하면 됩니다.
4. CSRF 실패 → **403 `FORBIDDEN`** ("접근 권한이 없거나 CSRF 토큰이 올바르지 않습니다."). 권한 없음과 코드가 같으므로, 403이면 CSRF를 한 번 다시 받아 재시도하는 것이 안전합니다.

### 1.4 오류 응답 형식

모든 JSON 오류는 아래 형식입니다 (입력한 값은 포함하지 않음).

```ts
interface ApiErrorResponse {
  code: string;            // 예: "INVALID_REQUEST"
  message: string;         // 화면에 그대로 보여도 되는 한글 안내
  errors: { field: string; message: string }[]; // 입력 항목별 오류 (없으면 [])
}
```

| HTTP | code | 상황 |
| --- | --- | --- |
| 400 | `INVALID_REQUEST` | `@Valid` 검증 실패(`errors`에 항목별 문구), JSON 형식 오류, UUID·매개변수 형식 오류, 페이지·정렬 오류 |
| 401 | `UNAUTHORIZED` | 로그인 필요 / 토큰 무효·만료 / 로그인 실패 |
| 403 | `FORBIDDEN` | 작성자 아님, 관리자 아님, CSRF 실패 |
| 404 | `POST_NOT_FOUND` · `COMMENT_NOT_FOUND` · `FAVORITE_TARGET_NOT_FOUND` · `INQUIRY_NOT_FOUND` · `NEWS_NOT_FOUND` · `AI_IMAGE_NOT_FOUND` | 대상 없음 |
| 409 | `DUPLICATE_EMAIL` · `INQUIRY_STATUS_CONFLICT` · `NEWS_ALREADY_APPROVED` · `AI_STYLE_RUNNING` | 충돌 |
| 429 | `TOO_MANY_REQUESTS` | 문의 IP 제한 초과 |
| 500 | `INTERNAL_ERROR` | 기타 DB 오류 |
| 503 | `SERVICE_UNAVAILABLE` · `AUTH_UNAVAILABLE` · `SYNC_UNAVAILABLE` | DB·Redis·외부 연동 장애 |

> ⚠️ **실종자 API의 404·400은 401로 올 수 있습니다.** `GET /api/missing-persons/{id}`(없는 아동)와 `GET /api/missing-persons?page=-1`(잘못된 페이지)는 `ResponseStatusException`을 던지고 Spring의 `/error`로 넘어가는데, `/error`가 보안 공개 목록에 없어 **401 `UNAUTHORIZED`** 로 바뀝니다. 사진 API(`.../images/{imageId}`)도 같습니다. 이 엔드포인트들은 **비로그인 공개 API이므로 401도 "찾을 수 없음"으로 처리**하세요.

### 1.5 페이지 응답

Spring `Pageable` 기반 API(게시글·댓글·관심아동·관리자 문의)는 쿼리 `page`(0부터), `size`(기본 10, 최대 100), `sort=필드,asc|desc`를 받고 아래 형식으로 응답합니다.

```ts
interface PageResponse<T> {
  content: T[];
  page: number;          // 0부터
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
```

실종자·관리자 뉴스 목록은 `hasNext`·`hasPrevious`가 **없습니다** (`content, page, size, totalElements, totalPages`만).

### 1.6 날짜·시간

- `LocalDateTime` 필드(`createdAt`, `updatedAt`, `savedAt`, `lastSeenAt` 등)는 **UTC이지만 시간대 표시가 없는 문자열**입니다. 예: `"2026-10-26T03:12:45.123456"`
  → 파싱할 때 `new Date(value + 'Z')`처럼 UTC로 해석한 뒤 KST로 표시하세요. 그대로 `new Date(value)` 하면 로컬 시간으로 잘못 해석됩니다.
- 뉴스(`NewsArticleResponse`)의 시각은 `Instant`라 `"2026-10-22T00:30:00Z"`처럼 `Z`가 붙어 옵니다.
- 실종자 `occurrenceDate`는 경찰청 원본 문자열 `"YYYYMMDD"`입니다 (`normalizeDate()` 사용).

### 1.7 본문 텍스트

게시글·댓글·문의 본문은 일반 텍스트입니다. `dangerouslySetInnerHTML`을 쓰지 말고 텍스트로 렌더링하며, 줄바꿈은 `whitespace-pre-line`으로 표시합니다.

---

## 2. 인증 `/api/auth`

### 2.1 `GET /api/auth/csrf` — 보안 토큰 준비

- 응답 200 (`Cache-Control: no-store`)

```json
{ "token": "b1c2...", "headerName": "X-XSRF-TOKEN" }
```

### 2.2 `POST /api/auth/login` — 로그인

- 헤더: `Content-Type: application/json`, CSRF 헤더, `credentials: 'include'`
- 요청

```ts
interface LoginRequest {
  email: string;     // 필수, 이메일 형식, ≤254자 (서버가 trim + 소문자 변환)
  password: string;  // 필수, 공백만 불가, 8자 이상, UTF-8 72바이트 이하
}
```

- 응답 200 + `Set-Cookie: findus_refresh=...; HttpOnly; SameSite=Lax; Path=/api/auth; Max-Age=604800`

```ts
interface TokenResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;   // 초, 기본 900
}
```

- 오류: 400 입력 형식 · 401 이메일/비밀번호 불일치 · 403 CSRF · 503 Redis

> 로그인 응답에는 회원 정보가 없습니다. 로그인 직후 `GET /api/members/me`를 호출해 사용자 정보를 채웁니다.

### 2.3 `POST /api/auth/refresh` — 토큰 재발급

- 본문 없음. Refresh 쿠키를 브라우저가 자동 전송 (§1.2 쿠키 경로 주의), CSRF 헤더 필요
- 응답 200: `TokenResponse` + 새 Refresh 쿠키
- 오류: 401 쿠키 없음·무효·이미 사용됨 → 로그인 화면으로 이동
- **동시에 여러 번 호출하지 마세요.** Refresh Token이 교체되므로 두 번째 호출은 401이 됩니다. 진행 중인 재발급 Promise를 공유(single-flight)해야 합니다.
- 페이지 새로고침 후에는 메모리의 Access Token이 사라지므로, 앱 시작 시 한 번 `refresh`를 호출해 로그인 상태를 복원합니다.

### 2.4 `POST /api/auth/logout` — 로그아웃

- 본문 없음, CSRF 헤더 필요
- 응답 **204**, Refresh 쿠키 삭제. 쿠키가 없어도 204
- 프론트는 메모리의 Access Token과 사용자 상태를 비웁니다.

---

## 3. 회원 `/api/members`

### 3.1 `POST /api/members` — 회원가입

- CSRF 불필요, 인증 불필요
- 요청

```ts
interface MemberSignupRequest {
  email: string;     // 필수, 이메일 형식, ≤254자 (trim + 소문자)
  password: string;  // 필수, 8자 이상, UTF-8 72바이트 이하, 공백만 불가 (앞뒤 공백 유지)
  name: string;      // 필수, ≤100자 (trim)
  nickname: string;  // 필수, ≤50자 (trim)
}
```

- 응답 **201**

```ts
interface MemberSignupResponse { id: string; email: string; name: string; nickname: string }
```

- 오류: 400 `INVALID_REQUEST`(`errors[].field` = `email`·`password`·`name`·`nickname`) · 409 `DUPLICATE_EMAIL`
- 가입 후 자동 로그인되지 않습니다. 필요하면 이어서 `login`을 호출합니다.

> 프론트 `lib/auth.ts`의 `AUTH_LIMITS`·`validateSignUp`을 위 제약과 맞추세요. 비밀번호 바이트 검사는 `new TextEncoder().encode(pw).length <= 72`.

### 3.2 `GET /api/members/me` — 내 정보

- JWT 필요
- 응답 200

```ts
interface MemberInfoResponse {
  id: string;
  email: string;
  name: string;
  nickname: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
}
```

- 오류: 401

---

## 4. 실종아동 `/api/missing-persons`

모두 비로그인 공개. 현재 `lib/missingApi.ts`에서 서버 측으로 연동되어 있습니다.

### 4.1 `GET /api/missing-persons?page=0&size=10` — 목록

- `page` ≥ 0, `size` 1~100 (기본 10)
- 원본 분류 `010`(실종아동)만, **발생일 기준 1년 이상** 경과한 건만, 공개 중단 제외, `occurrenceDate` 내림차순
- 응답 200

```ts
interface MissingPageResponse {
  content: MissingPersonDto[];
  page: number; size: number; totalElements: number; totalPages: number; // hasNext 없음
}

interface MissingPersonDto {
  id: string;               // 우리 DB UUID (관심아동·상세에 사용)
  sourceId: string;         // 경찰청 원본 식별자
  name: string;
  category: string;         // "010"
  sex: string | null;       // "남자" | "여자" 등 원본 문자열
  occurrenceDate: string | null; // "YYYYMMDD"
  age: number | null;       // 실종 당시 나이
  ageNow: number | null;    // 현재 나이
  address: string | null;   // 발생 장소
  clothing: string | null;
  features: string | null;
  photoUrl: string | null;  // 대표 사진 상대 경로. 미동기화 데이터는 경찰청 원본 주소일 수 있음 → 표시하지 말 것
  images: MissingImageDto[];
  lastSeenAt: string;       // 마지막 동기화 시각 (UTC, LocalDateTime)
  attribution: string;      // "자료 출처: 경찰청" — 화면에 반드시 표시
  aiPhotoUrl: string | null; // "/api/missing-persons/{id}/ai-image/photo" 또는 null
}

interface MissingImageDto {
  id: string;
  sortOrder: number;  // 0이 대표
  url: string;        // "/api/missing-persons/{personId}/images/{imageId}"
  contentType: string;
  byteSize: number;
}
```

### 4.2 `GET /api/missing-persons/{id}` — 상세

- 응답 200: `MissingPersonDto`
- 없음·공개 중단: 404 (실제로는 **401로 올 수 있음**, §1.4)

### 4.3 `GET /api/missing-persons/{personId}/images/{imageId}` — 사진

- `image/jpeg` 또는 `image/png` 바이너리, `Cache-Control: no-store`
- `<img src={'/backend' + image.url}>`로 사용. 다른 아동 사진·공개 중단 사진은 404(→401 가능)

---

## 5. AI 이미지 `/api/missing-persons/{personId}/ai-image`

AI가 만든 예상 모습입니다. 화면에 **"AI가 만든 예상 모습이며 실제 모습이 아닙니다."** 안내(응답의 `notice`)를 함께 표시합니다.

### 5.1 `GET /api/missing-persons/{personId}/ai-image` — 대표 AI 사진 정보

- 응답 200

```ts
interface MissingAiImageResponse {
  id: string;          // 대표 AI 사진 id
  targetAge: number;   // 생성 시 목표 나이
  createdAt: string;   // UTC LocalDateTime
  url: string;         // "/api/missing-persons/{personId}/ai-image/photo"
  styles: {            // 성별에 맞는 스타일 중 "저장된 것만", 설정 순서
    key: string;       // 예: "bob"
    name: string;      // 버튼 라벨, 예: "단발"
    url: string;       // ".../ai-image/photo?style=bob"
  }[];
  notice: string;      // "AI가 만든 예상 모습이며 실제 모습이 아닙니다."
}
```

- 404 `AI_IMAGE_NOT_FOUND`: 대표 AI 사진이 없거나 공개 중이 아닌 아동 → AI 영역을 숨김
- 스타일 key 목록 (백엔드 `application.yml`)

| 성별 | key → name |
| --- | --- |
| 남 | `buzz` 아주 짧은 머리 · `short` 짧은 머리 · `short_bang` 덮머 |
| 여 | `short` 숏컷 · `bob` 단발 · `bob_bang` 앞머리 단발 · `long` 긴 머리 · `long_bang` 앞머리 긴 머리 |

### 5.2 `GET /api/missing-persons/{personId}/ai-image/photo?style={key}` — 사진

- `style` 생략 시 대표 AI 사진, 지정 시 해당 스타일 사진
- `image/png`·`image/jpeg`, `Cache-Control: private, max-age=600` (버튼 전환이 빠르도록 10분 캐시)
- 저장되지 않은 스타일·사진 없음: 404 (본문 없음)

**구현 흐름:** 상세 진입 시 5.1 호출 → 기본 `<img src={'/backend' + url}>` → 스타일 버튼은 `styles`로 그리고, 누르면 `src`만 `'/backend' + style.url`로 교체. 목록 카드에서는 `MissingPersonDto.aiPhotoUrl`만으로 충분합니다.

---

## 6. 관심아동 `/api/members/me/favorites`

JWT 필요. 현재 `lib/favorites.ts`는 localStorage 목업입니다.

### 6.1 `GET /api/members/me/favorites?page=0&size=10` — 내 관심아동 목록

- `sort` 허용: `createdAt`, `id` (기본 `createdAt,desc`), size 최대 100
- 응답 200: `PageResponse<FavoriteResponse>`

```ts
interface FavoriteResponse {
  id: string;                 // 관심 등록 UUID
  missingPersonId: string;    // 실종아동 UUID (등록·취소 URL에 사용)
  savedAt: string;            // 최초 등록 시각 (UTC). 재등록해도 유지
  availability: "AVAILABLE" | "UNAVAILABLE" | "NOT_CHILD";
  child: MissingPersonDto | null; // AVAILABLE일 때만 값, 그 외 null
}
```

- `UNAVAILABLE`(공개 중단·삭제), `NOT_CHILD`(분류 변경)는 "더 이상 공개되지 않는 정보" 카드로 표시하고 취소 버튼만 제공합니다.
- 오류: 400 `INVALID_REQUEST`(페이지·정렬) · 401

### 6.2 `PUT /api/members/me/favorites/{missingPersonId}` — 등록

- 본문 없음, CSRF 필요. **멱등** (이미 등록돼도 200, 취소했던 것은 복원)
- 응답 200: `FavoriteResponse`
- 오류: 400 `INVALID_FAVORITE_TARGET`(분류 010 아님) 또는 UUID 형식 오류 · 404 `FAVORITE_TARGET_NOT_FOUND` · 401 · 403(CSRF)

### 6.3 `DELETE /api/members/me/favorites/{missingPersonId}` — 취소

- CSRF 필요. **멱등** (이미 취소돼도 204)
- 응답 **204**

> 프론트 `Favorites`의 "내 아이(setOwnChild)" 기능은 백엔드에 없습니다. 당분간 localStorage로 유지하거나 백엔드에 별도 요청이 필요합니다.
> 비로그인 사용자의 관심 목록은 서버에 저장할 수 없으므로, 로그인 유도 또는 로그인 시 로컬 목록을 PUT으로 옮기는 정책을 정해야 합니다.

---

## 7. 게시글 `/api/posts`

현재 `lib/community.ts`는 목업입니다.

### 7.1 `GET /api/posts?page=0&size=10&sort=createdAt,desc` — 목록

- 공개. `sort` 허용: `createdAt`, `updatedAt`, `title`, `id` (기본 `createdAt,desc` + `id,desc`). 삭제된 글 제외
- 응답 200: `PageResponse<PostSummaryResponse>` (본문 없음)

```ts
interface PostAuthor { id: string; nickname: string } // 탈퇴 회원은 nickname "탈퇴한 회원"

interface PostSummaryResponse {
  id: string;
  title: string;
  author: PostAuthor;
  createdAt: string;  // UTC
  updatedAt: string;  // UTC
}
```

### 7.2 `GET /api/posts/{id}` — 상세

- 응답 200

```ts
interface PostResponse extends PostSummaryResponse { content: string }
```

- 오류: 400 UUID 형식 · 404 `POST_NOT_FOUND`(없음·삭제됨)

### 7.3 `POST /api/posts` — 작성

- JWT + CSRF
- 요청

```ts
interface PostWriteRequest {
  title: string;    // 필수, 공백만 불가, ≤200자 (trim)
  content: string;  // 필수, 공백만 불가, ≤10000자
}
```

- 응답 **201** `PostResponse` + `Location: /api/posts/{id}`
- 오류: 400 (`errors[].field` = `title`·`content`) · 401 · 403

### 7.4 `PUT /api/posts/{id}` — 수정

- JWT + CSRF, **작성자만**. 제목·본문 모두 보냄 (`PostWriteRequest`)
- 응답 200 `PostResponse`
- 오류: 400 · 401 · 403 `FORBIDDEN`(작성자 아님) · 404

### 7.5 `DELETE /api/posts/{id}` — 삭제 (소프트 삭제)

- JWT + CSRF, 작성자만. 응답 **204**
- 오류: 401 · 403 · 404

> **프론트와의 차이 (백엔드에 없음):** 카테고리(`notice`·`info`·`story`·`question`), 댓글 수, 좋아요, 첨부. 목록에서 카테고리 탭·필터를 쓰려면 백엔드 필드 추가가 필요합니다. 그 전까지는 카테고리 UI를 숨기거나 공지를 프론트 상수로 유지하세요.
> 수정·삭제 버튼 노출 여부는 `post.author.id === me.id`로 판단합니다 (`GET /api/members/me`의 `id`).

---

## 8. 댓글 `/api/posts/{postId}/comments`

### 8.1 `GET /api/posts/{postId}/comments?page=0&size=10` — 목록

- 공개. 기본 `createdAt,asc` + `id,asc` (오래된 순). `sort` 허용: `createdAt`, `updatedAt`, `id`
- 응답 200: `PageResponse<CommentResponse>`

```ts
interface CommentResponse {
  id: string;
  postId: string;
  content: string;      // 줄바꿈 보존
  author: { id: string; nickname: string };
  createdAt: string;    // UTC
  updatedAt: string;    // UTC
}
```

- 오류: 400 · 404 `POST_NOT_FOUND`(게시글 없음·삭제)

### 8.2 `POST /api/posts/{postId}/comments` — 작성

- JWT + CSRF
- 요청 `{ "content": string }` — 필수, 공백만 불가, ≤1000자
- 응답 **201** `CommentResponse`
- 오류: 400 · 401 · 403 · 404

### 8.3 `PUT /api/posts/{postId}/comments/{commentId}` — 수정

- JWT + CSRF, 댓글 작성자만. 요청 `{ "content": string }`
- 응답 200 `CommentResponse`
- 오류: 403 `FORBIDDEN` · 404 `COMMENT_NOT_FOUND`(다른 게시글의 댓글·삭제된 댓글 포함)

### 8.4 `DELETE /api/posts/{postId}/comments/{commentId}` — 삭제

- JWT + CSRF, 댓글 작성자만(게시글 작성자·관리자도 불가). 응답 **204**

---

## 9. 뉴스 `/api/news`

### `GET /api/news?placement=HOME` — 공개 기사

- `placement`: `HOME`(기본) 또는 `MYPAGE`. `BOTH`를 보내면 400
- 해당 위치 또는 `BOTH`로 승인되고 종료일이 지나지 않은 기사, 승인 최신순 **최대 30건**
- 응답 200: **배열** (페이지 아님)

```ts
interface NewsArticleResponse {
  id: string;
  title: string;          // 서버가 <b> 태그·HTML 엔티티 제거한 텍스트
  originalUrl: string;    // 원문 링크 (target="_blank" rel="noopener noreferrer")
  naverUrl: string | null;
  publishedAt: string | null; // ISO Instant, "...Z"
  placement: "HOME" | "MYPAGE" | "BOTH";
  expiresAt: string | null;   // ISO Instant
  approvedAt: string;         // ISO Instant
  // note는 공개 응답에 포함되지 않음
}
```

---

## 10. 문의 `/api/inquiries`

### `POST /api/inquiries` — 문의 접수

- 비회원 가능, **CSRF 불필요**. JWT가 유효하면 회원으로 연결, 무효면 비회원으로 처리(401 없음)
- 같은 IP 10분 5건 제한 (백엔드는 `X-Forwarded-For` 첫 값을 IP로 사용)
- 요청 (현재 `components/InquiryForm.tsx` 본문과 동일 구조)

```ts
interface InquiryCreateRequest {
  type: "BUG" | "FEATURE" | "CORRECTION" | "ETC"
      | "오류 신고" | "기능 제안" | "정보 정정 요청" | "기타"; // 코드·한글 라벨 모두 허용
  message: string;    // trim 후 10~1000자
  email?: string;     // 선택, ≤254자. 입력 시 agree=true 필요
  agree?: boolean;    // 이메일 수집 동의
  page?: string;      // 보낸 화면 경로 (200자 초과 시 잘림)
  website?: string;   // 허니팟 숨김 칸. 사람은 빈 문자열. 값이 있으면 저장 없이 성공처럼 201
}
```

- 응답 **201** `{ id: string; createdAt: string }` (본문·이메일은 되돌려주지 않음)
- 오류
  - 400 `INVALID_REQUEST`: `message`에 **첫 번째 오류 문구**가 들어 있어 그대로 표시하면 됩니다. 항목 순서·문구는 `lib/inquiry.ts`의 `validateInquiry`와 동일
    - "문의 유형을 골라 주세요." / "내용을 10자 이상 적어 주세요." / "내용은 1000자까지 적을 수 있어요." / "이메일 주소를 다시 확인해 주세요." / "답변을 받으려면 이메일 수집에 동의해 주세요."
  - 429 `TOO_MANY_REQUESTS`: "문의가 너무 많아요. 잠시 후 다시 시도해 주세요."

> **연동 방법:** 지금은 `app/api/inquiry/route.ts`가 웹훅으로 보냅니다. 백엔드로 바꿀 때는 이 Route Handler에서 `BACKEND_URL/api/inquiries`로 전달하면서 원 요청의 클라이언트 IP를 `X-Forwarded-For`로 넘기는 방식을 권장합니다 (헤더가 없으면 모든 문의가 Next 서버 IP 하나로 묶여 5건 제한에 함께 걸림). 실종 제보는 받지 않으므로 화면에 182·112 안내를 유지합니다.

---

## 11. 상태 확인 `/health`

- `GET /health` → `text/plain`, 모두 정상 200 / 하나라도 실패 503

```text
Spring Boot: ok
PostgreSQL: ok
Redis: ok
...
```

---

## 12. 구현 가이드 (권장 클라이언트)

`lib/api.ts`(신규)에 공통 클라이언트를 두고 `lib/auth.ts`·`lib/community.ts`·`lib/favorites.ts`의 "저장소" 영역만 교체하는 구성을 권장합니다.

```ts
// lib/api.ts
const BASE = "/backend";
const AUTH_BASE = ""; // §1.2 방법 1 적용 시 인증 API는 접두사 없이 /api/auth/...

export interface ApiErrorBody { code: string; message: string; errors: { field: string; message: string }[] }

export class ApiError extends Error {
  constructor(public status: number, public body: ApiErrorBody | null) {
    super(body?.message ?? "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => { accessToken = token; };

function readCsrfCookie() {
  return document.cookie.split("; ").find((c) => c.startsWith("XSRF-TOKEN="))?.split("=")[1] ?? null;
}

async function csrfToken(): Promise<string> {
  const cached = readCsrfCookie();
  if (cached) return decodeURIComponent(cached);
  const res = await fetch(`${AUTH_BASE}/api/auth/csrf`, { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new ApiError(res.status, null);
  return (await res.json()).token;
}

// 재발급은 동시에 한 번만 (Refresh Token rotation)
let refreshing: Promise<boolean> | null = null;
export function refreshAccessToken(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const res = await fetch(`${AUTH_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "X-XSRF-TOKEN": await csrfToken() },
      });
      if (!res.ok) { setAccessToken(null); return false; }
      setAccessToken((await res.json()).accessToken);
      return true;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

interface ApiOptions extends Omit<RequestInit, "body"> { json?: unknown; auth?: boolean }

export async function api<T>(path: string, { json, auth = false, ...init }: ApiOptions = {}, retried = false): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (json !== undefined) headers.set("Content-Type", "application/json");
  if (method !== "GET") headers.set("X-XSRF-TOKEN", await csrfToken());
  if (auth && accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    method,
    headers,
    credentials: "include",
    body: json === undefined ? undefined : JSON.stringify(json),
  });

  if (res.status === 401 && auth && !retried && (await refreshAccessToken())) {
    return api<T>(path, { json, auth, ...init }, true);
  }
  if (!res.ok) {
    const body = res.headers.get("content-type")?.includes("application/json") ? await res.json() : null;
    throw new ApiError(res.status, body);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}
```

사용 예:

```ts
// 로그인 → 내 정보
const { accessToken } = await fetch("/api/auth/login", {
  method: "POST", credentials: "include",
  headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": await csrfToken() },
  body: JSON.stringify({ email, password }),
}).then((r) => (r.ok ? r.json() : Promise.reject(r)));
setAccessToken(accessToken);
const me = await api<MemberInfoResponse>("/api/members/me", { auth: true });

// 게시글
const page = await api<PageResponse<PostSummaryResponse>>(`/api/posts?page=${p}&size=10`);
const post = await api<PostResponse>("/api/posts", { method: "POST", auth: true, json: { title, content } });

// 관심아동
await api<FavoriteResponse>(`/api/members/me/favorites/${id}`, { method: "PUT", auth: true });
await api<void>(`/api/members/me/favorites/${id}`, { method: "DELETE", auth: true });
```

### 화면별 체크리스트

- [ ] `next.config.ts`에 `/api/auth/:path*` rewrite 추가 (§1.2)
- [ ] 앱 시작 시 `refreshAccessToken()` → 성공하면 `GET /api/members/me`로 `useCurrentUser` 상태 채움
- [ ] `lib/auth.ts`: `signUp`·`logIn`·`logOut`을 API로 교체, `hashPassword`·localStorage 회원 목록 제거
- [ ] 400 응답의 `errors[]`를 폼 항목별 오류로 매핑 (`field` = 요청 필드명)
- [ ] `lib/community.ts`: 카테고리 처리 방침 결정 후 목록·상세·작성·댓글 교체, 페이지네이션은 서버 `page`·`totalPages` 사용
- [ ] 날짜 표시 함수(`formatPostDate` 등)에서 `LocalDateTime` 문자열을 UTC로 해석 (§1.6)
- [ ] `lib/favorites.ts`: 로그인 사용자는 서버 API, `availability !== "AVAILABLE"` 카드 처리
- [ ] AI 사진: `GET .../ai-image`로 스타일 버튼 구성, `notice` 표시
- [ ] 홈·마이페이지 뉴스: `GET /api/news?placement=HOME|MYPAGE`
- [ ] 문의: Route Handler에서 백엔드로 전달 + `X-Forwarded-For`
- [ ] 실종자 상세의 401을 "찾을 수 없음"으로 처리 (§1.4)

---

## 부록 A. 관리자 API (`/api/admin/**`, ADMIN 권한)

모두 JWT(ADMIN) 필요, 쓰기는 CSRF 필요. 일반 회원은 403.

### A.1 문의 관리

| 메서드·경로 | 설명 |
| --- | --- |
| `GET /api/admin/inquiries?status=&type=&page=0&size=20` | 목록. 기본 20개·최대 100, `sort`는 `createdAt`만. 응답 `PageResponse<InquiryResponse>` |
| `GET /api/admin/inquiries/{id}` | 상세 |
| `PUT /api/admin/inquiries/{id}` | 처리. 본문 `{ status, adminMemo? }` |
| `DELETE /api/admin/inquiries/{id}` | 소프트 삭제, 204 |

```ts
type InquiryStatus = "RECEIVED" | "IN_PROGRESS" | "ANSWERED" | "CLOSED"; // 이 순서로만 진행, 되돌리면 409
interface InquiryResponse {
  id: string; type: "BUG" | "FEATURE" | "CORRECTION" | "ETC"; status: InquiryStatus;
  message: string; email: string | null;  // ANSWERED·CLOSED가 되면 이메일 삭제(null)
  page: string | null; memberId: string | null; adminMemo: string | null; // 메모 ≤2000자, 비우면 삭제
  answeredAt: string | null; createdAt: string; updatedAt: string;
}
```

### A.2 뉴스 관리

| 메서드·경로 | 설명 |
| --- | --- |
| `GET /api/admin/news/naver?query=&start=1&display=10&sort=date` | 네이버 검색 결과 JSON 원본 전달 (저장 안 함). `start` 1~1000, `display` 1~100, `sort` `date`·`sim` |
| `POST /api/admin/news` | 기사 승인, 201 `NewsArticleResponse`(관리자 응답은 `note` 포함). 같은 원문 노출 중이면 409 |
| `GET /api/admin/news?page=0&size=20` | 노출 중 기사 목록 (`content, page, size, totalElements, totalPages`) |
| `DELETE /api/admin/news/{id}` | 노출 중단, 204 |

```ts
interface NewsApproveRequest {
  title: string;        // 네이버 title 그대로 (≤2000)
  originalUrl: string;  // originallink, 비면 link (≤2048, http/https)
  naverUrl?: string;    // link
  pubDate?: string;     // 네이버 pubDate 그대로 (RFC 1123)
  placement?: "HOME" | "MYPAGE" | "BOTH"; // 생략 시 BOTH
  expiresAt?: string;   // 시간대 포함 ISO, 현재 이후. 생략 시 계속 노출
  note?: string;        // ≤2000, 공개 안 됨
}
```

### A.3 실종자 동기화 · AI 스타일 생성

| 메서드·경로 | 설명 |
| --- | --- |
| `POST /api/admin/missing-sync` | 경찰청 동기화 실행, 완료까지 수 분 대기. 응답 `{ executionId, status: "COMPLETED"\|"FAILED", counts }`. 시작 실패 503 |
| `GET /api/admin/missing-sync` | 최근 20건 `{ execution_id, status, start_time, end_time }[]` |
| `POST /api/admin/ai-styles/generate?personId=` | 머리 스타일 일괄 생성 시작, **202** + 상태. 실행 중이면 409 `AI_STYLE_RUNNING` |
| `GET /api/admin/ai-styles/generate` | 진행 상태 `{ state: "IDLE"\|"RUNNING"\|"DONE"\|"FAILED", startedAt, finishedAt, total, created, skipped, failed, current, errors[] }` |

> local 프로필에서는 `missing-sync`가 비로그인·CSRF 없이 열려 있습니다 (배포 전 제거 예정 TODO).

## 부록 B. 로컬 전용 (프론트에서 사용하지 않음)

- `POST /api/dev/dummy-data`: 더미 회원 5·게시글 36·댓글 72 생성 (CSRF 필요). 더미 계정 `dummy.persistent1@example.test` ~ `5`, 비밀번호 `Dummy-test123!`
- `/api/local/aiworkbench/**`: Python AI 작업 화면 전용 (`AI_WORKBENCH_ENABLED=true`일 때만)
- `GET /test/safe182`: 실종아동 DB 확인 HTML
- Swagger UI `http://localhost:18080/swagger-ui/index.html`, OpenAPI `http://localhost:18080/v3/api-docs`
