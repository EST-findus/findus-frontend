# AGENTS.md

AI 코딩 에이전트(Claude Code, Codex 등)가 이 저장소에서 작업할 때 따르는 공통 규칙입니다.
Claude Code는 `CLAUDE.md`에서 이 파일을 불러오므로, 규칙은 이 파일 한 곳에서만 수정합니다.

## 프로젝트

- findus 프론트엔드: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4
- 테스트: vitest
- 백엔드 API는 `next.config.ts`의 `/backend/*` 프록시를 통해 호출 (`BACKEND_URL`, `.env.example` 참고)

## 명령어

```bash
npm run dev        # 개발 서버
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # vitest run
npm run build      # 프로덕션 빌드
```

커밋 전 `lint`, `typecheck`, `test`가 통과해야 합니다.

## 커밋 규칙

### 형식 (Conventional Commits)

```
<type>: <한글 요약>

- 변경 내용 1
- 변경 내용 2
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

- 요약은 한글로, 마침표 없이 50자 이내로 씁니다.
- 본문은 필요할 때만 `-` 목록으로 무엇을, 왜 바꿨는지 적습니다.
- 커밋 하나에는 논리적인 변경 하나만 담습니다.

### AI 작성 표시 금지

- 커밋 메시지와 PR 본문에 `Co-Authored-By: Claude ...`, `Generated with Claude Code`, Codex 서명 등 **AI 도구가 작성했다는 표시를 넣지 않습니다.**
- 작성자(author)는 로컬 git 설정의 사용자 그대로 둡니다.

### 금지 사항

- `.env` 등 비밀 값이 담긴 파일은 커밋하지 않습니다 (`.env.example`만 허용).
- 사용자가 요청하지 않으면 커밋/푸시하지 않습니다.
- `--no-verify`, force push 등은 사용자의 명시적 요청 없이 사용하지 않습니다.
