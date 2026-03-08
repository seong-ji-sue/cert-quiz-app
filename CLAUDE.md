# CLAUDE.md (cert-quiz-app)

## 🎯 Project Overview
**자격증 AI 학습 및 랜덤 문제 출제 서비스**
- AI 기반 문제 생성, 자동 채점, 상세 해설 제공.
- 모노레포(Monorepo) 구조의 JavaScript 기반 Next.js/NestJS 프로젝트.

## 🛠 Tech Stack & Roles
- **Roles**: Gemini/Grok(기획/리뷰), Claude(아키텍처/코딩), Claude Code(실행/Git)
- **Stack**: Next.js 14 (Pages Router), NestJS, MariaDB, Prisma, SCSS
- **Environment**: Docker (Runtime), IntelliJ (Remote SSH)
- **Package Manager**: **yarn** (v4.x, node-modules linker) — 반드시 yarn 사용

## 📁 Monorepo Package Structure
```
packages/
├── host/           # Next.js 14 — FE 메인 쉘 (Module Federation Host, port 4000)
├── remote/         # Next.js 14 — FE 원격 모듈 (Module Federation Remote, port 4001)
├── api/            # NestJS    — BE REST API (port 4010) [Phase 1 생성 예정]
├── client-common/  # 공유 FE 라이브러리 (@nextpr/client-common)
└── server-common/  # 공유 BE 라이브러리 (@nextpr/server-common)
```
> `packages/server`는 레거시 Express 서버 → `packages/api`(NestJS)로 교체 예정

## 🌍 Environment Variables
- `.env.development`: 개발 환경 URL/포트 (git tracked, 시크릿 없음)
- `.env.production`: 운영 환경 URL/포트 (git tracked, 시크릿 없음)
- `.env.local`: **실제 시크릿** (gitignored) — SLACK_WEBHOOK_URL, DB URL, API Key 등

---

## 🔄 Development Workflow (엄격 준수)

> 전체 상세 내용: `docs/WORKFLOW.md`

### 매 작업 시 반드시 따를 순서:

```
① feature 브랜치 생성 (develop에서 분기)
    git checkout develop && git checkout -b feature/작업명

② 개발 & 상황별 커밋
    (feat/fix/docs/chore/refactor/wip 타입 사용)

③ AI 코드 리뷰 수행 → docs/review/YYYY-MM-DD-브랜치명.md 기록

④ 서버 실행 검증
    bash scripts/verify.sh

⑤ 브랜치 푸시 + Slack 알림 (ship.sh 사용)
    bash scripts/ship.sh "작업 내용 요약"

⑥ 사용자가 Slack 알림 확인 후 머지 결정
    (사용자 승인 없이 develop/master 머지 금지)
```

---

## 🤖 자율 실행 원칙 (승인 최소화)

**자동 실행 가능 (승인 불필요):**
- 파일 읽기/쓰기/편집
- `yarn install`
- `git add`, `git commit`
- `git push origin feature/*` (feature 브랜치에만)
- `git checkout -b feature/*` (새 브랜치 생성)
- 개발 서버 실행 및 curl 헬스체크
- `docs/` 문서 작성 및 업데이트
- `scripts/` 스크립트 실행

**반드시 사용자 확인 필요:**
- `develop` / `master` 브랜치 머지 또는 직접 커밋
- `git push --force`
- 파일/디렉터리 삭제
- `.env.*` 파일 수정
- docker-compose 스택 재시작

---

## 📋 Operational Workflow (문서 관리)

### 1. 단계별 메인 문서 (/docs)
작업 시작 전 해당 파일을 읽고, 종료 후 업데이트합니다.

| 파일 | 설명 | 갱신 시점 |
|------|------|----------|
| `docs/README.md` | 문서 파일 목록 및 설명 | 새 문서 추가 시 |
| `docs/WORKFLOW.md` | 개발 워크플로우 전체 프로세스 | 프로세스 변경 시 |
| `docs/PLAN.md` | 서비스 기획 및 기능 명세 | 기획 변경 시 |
| `docs/ARCH.md` | 아키텍처 및 모노레포 구조 | 구조 변경 시 |
| `docs/SCHEMA.md` | DB 모델링 및 Prisma 스키마 | 테이블 변경 시 |
| `docs/FE_DEV.md` | 프론트엔드 개발 명세 | FE 개발 시 |
| `docs/BE_DEV.md` | 백엔드 개발 명세 | BE 개발 시 |

### 2. AI 리뷰 기록 (/docs/review)
- **형식**: `docs/review/YYYY-MM-DD-브랜치명.md`
- **내용**: 변경 파일 검토, 오류/보안/스타일 점검, 최종 판정
- **판정**: ✅ 머지 가능 / ⚠️ 수정 후 재검토 / ❌ 머지 불가

### 3. 작업 이력 (/docs/history)
- **형식**: `docs/history/YYYY-MM-DD.md`
- **내용**: `[작업 내용]`, `[오류 기록]`, `[결과 확인]`

---

## 🌿 Git Workflow & Commit Convention

### Branch Strategy
- `master`: 안정된 배포 브랜치
- `develop`: 통합 개발 브랜치
- `feature/기능명`: **작업마다 새 브랜치** (develop에서 분기)
- `fix/이슈명`: 버그 수정 브랜치
- `hotfix/이슈명`: 긴급 수정 (master에서 분기)

### Commit Message Format
`타입(범위): [YYYY-MM-DD] 내용`
- **타입**: `feat`, `fix`, `docs`, `refactor`, `chore`, `wip`
- **예시**: `feat(auth): [2026-03-08] JWT 로그인 API 구현`

---

## 💻 CLI Commands

```bash
# 패키지 설치 (반드시 yarn)
yarn install

# 개발 서버 실행 (전체)
yarn start

# 서버 실행 검증
bash scripts/verify.sh

# 작업 완료 후 푸시 + Slack 알림
bash scripts/ship.sh "작업 내용 요약"
bash scripts/ship.sh "작업 요약" --no-verify   # 검증 생략

# 슬랙 알림 직접 전송
./notify.sh "메시지"

# AI 리뷰 기록
bash scripts/review.sh pass "리뷰 요약"        # 통과
bash scripts/review.sh warn "수정 필요 사항"   # 경고
bash scripts/review.sh fail "머지 불가 이유"   # 실패
```
