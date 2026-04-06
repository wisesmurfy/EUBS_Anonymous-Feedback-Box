# CLAUDE.md

이 파일은 이 저장소에서 작업할 때 Claude Code(claude.ai/code)에게 안내를 제공합니다.

## 프로젝트 개요

**EUBS 익명 소리함** — 방송 동아리를 위한 익명 피드백·신고 접수 및 프로그램 기획안 제출 시스템. 두 가지 핵심 기능: (1) 관리자가 처리하는 익명 피드백/신고 접수, (2) 점수화된 관리자 피드백을 포함한 프로그램 기획안 제출.

## 명령어

```bash
npm run dev     # 개발 서버 시작
npm run build   # 프로덕션 빌드
npm run lint    # ESLint 검사
```

## 환경 변수

`.env.example`을 `.env.local`로 복사하여 사용. 아래 6개 변수 모두 필수:

| 변수 | 용도 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서비스 롤 키 — 서버 전용, 클라이언트에 노출 금지 |
| `RESEND_API_KEY` | Resend 이메일 API 키 |
| `RESEND_FROM_EMAIL` | 발신자 이메일 주소 |
| `NEXT_PUBLIC_APP_URL` | 배포 URL (이메일 링크에 사용) |

## 아키텍처

### Supabase 클라이언트

[src/lib/supabase/server.ts](src/lib/supabase/server.ts)에 두 가지 클라이언트:
- `createClient()` — 쿠키 기반 SSR 클라이언트. 서버 컴포넌트 및 인증이 필요한 Route Handler에서 사용.
- `createAdminClient()` — 서비스 롤 클라이언트. `auth.users` 조회, RLS 우회 등 권한 작업에 사용. **Route Handler에서만 사용, 서버 컴포넌트에서는 사용 금지.**

미들웨어([src/middleware.ts](src/middleware.ts))는 `/admin/login`을 제외한 모든 `/admin/*` 경로를 Supabase 세션으로 보호.

### 라우트 구조

**공개 라우트:**
- `/` — 메인 페이지
- `/submit` — 익명 피드백/신고 폼
- `/proposals/submit` — 프로그램 기획안 제출 폼
- `/proposals/[token]` — 기획안 제출자 개인 조회 페이지 (`view_token` 기반 접근)

**관리자 라우트** (Supabase 인증 필요):
- `/admin` — 제출물 대시보드
- `/admin/[id]` — 제출물 상세 (상태 관리, 메모, 답변 이메일)
- `/admin/proposals` — 기획안 목록
- `/admin/proposals/[id]` — 기획안 상세 (점수 피드백 에디터)
- `/admin/settings` — 관리자 프로필 설정

### API 라우트

모든 API 라우트는 `src/app/api/` 하위:

| 라우트 | 메서드 | 용도 |
|---|---|---|
| `/api/submit` | POST | 익명 제출물 저장 + 관리자에게 알림 이메일 발송 |
| `/api/proposals` | POST | 기획안 생성 (`view_token` 자동 생성) |
| `/api/proposals/[token]` | GET | 토큰 기반 공개 기획안 조회 |
| `/api/admin/submissions` | GET | 제출물 목록 조회 (인증 필요) |
| `/api/admin/submissions/[id]` | GET, PATCH, POST | 제출물 조회/수정; POST는 신고자에게 답변 이메일 발송 |
| `/api/admin/proposals` | GET | 기획안 목록 조회 (인증 필요) |
| `/api/admin/proposals/[id]` | GET, PATCH, POST | 기획안 조회/수정; POST는 점수 피드백 upsert + 제출자에게 이메일 발송 |

### 데이터 모델 ([src/lib/types/index.ts](src/lib/types/index.ts) 참조)

**Submissions**: `feedback` | `report` 타입. `status`는 `unread → read → in_progress → resolved` 흐름. `answer_email`은 신고 타입에서만 사용되며 답변 발송 후 null로 초기화. `admin_activity_log`에 열람/상태변경/답변 이력 기록.

**Proposals**: `view_token`(UUID, 공개 링크용), `status`(`pending → reviewed → approved/rejected`), 관련 `proposal_feedbacks` 테이블의 `sections: FeedbackSection[]` JSON 컬럼(각 섹션: `title`, `score`, `max_score`, `comment`).

### 이메일

[src/lib/email/resend.ts](src/lib/email/resend.ts)에서 `getResend()`와 `FROM_EMAIL` export. 템플릿은 [src/lib/email/templates/](src/lib/email/templates/)의 React Email 컴포넌트. 템플릿 3종: 신규 제출 알림(관리자 수신), 신고 답변(신고자 수신), 기획안 피드백 완료(제출자 수신).

제출 흐름에서 이메일 발송은 fire-and-forget 방식 — 실패해도 API 응답에 영향 없음.

### 유틸리티

- `cn()` ([src/lib/utils/cn.ts](src/lib/utils/cn.ts)) — `clsx` + `tailwind-merge` 축약
- [src/lib/utils/validation.ts](src/lib/utils/validation.ts) — 폼 입력값 Zod 스키마
- [src/lib/utils/format.ts](src/lib/utils/format.ts) — 날짜/레이블 포맷 헬퍼
- `SUBMISSION_STATUS_LABELS` 등 레이블 맵은 `src/lib/types/index.ts`에서 export되어 UI와 API 양쪽에서 사용
