# CLAUDE.md (cert-quiz-app)

## 🎯 Project Overview
**자격증 AI 학습 및 랜덤 문제 출제 서비스**
- AI 기반 문제 생성, 자동 채점, 상세 해설 제공.
- 모노레포(Monorepo) 구조의 JavaScript 기반 Next.js/NestJS 프로젝트.

## 🛠 Tech Stack & Roles
- **Roles**: Gemini/Grok(기획/리뷰), Claude(아키텍처/코딩), Claude Code(실행/Git)
- **Stack**: Next.js 14 (Pages Router), NestJS, MariaDB, Prisma, SCSS
- **Environment**: Docker (Runtime), IntelliJ (Remote SSH)
- **Package Manager**: **yarn** (v4.x, node-modules linker)

## 📁 Monorepo Package Structure
```
packages/
├── host/           # Next.js 14 — FE 메인 쉘 (Module Federation Host, port 4000)
├── remote/         # Next.js 14 — FE 원격 모듈 (Module Federation Remote, port 4001)
├── api/            # NestJS    — BE REST API 서버 (port 4010) [예정]
├── client-common/  # 공유 FE 라이브러리 (@nextpr/client-common)
└── server-common/  # 공유 BE 라이브러리 (@nextpr/server-common)
```
> `packages/server`는 레거시 Express 서버로, `packages/api` (NestJS)로 교체 예정.

## 🌍 Environment Variables
`.env` 파일은 환경별로 2개 분리 관리합니다.
- `.env.development`: 개발 환경 변수 (NODE_ENV=development, localhost URL)
- `.env.production`: 운영 환경 변수 (NODE_ENV=production, 실제 서버 URL)
- **실제 시크릿 값**(API Key 등)은 `.env.local` 또는 별도 비밀 관리 시스템에 보관 (gitignore)

## 📋 Operational Workflow (Strict Process)
모든 작업은 아래 절차에 따라 단계별(Phase)로 진행하며, 각 단계는 전용 `.md` 파일에 기록됩니다.

### 1. 단계별 메인 문서 관리 (/docs)
작업 시작 전 해당 파일을 읽고, 종료 후 업데이트합니다.
- `PLAN.md`: 전체 기획 및 기능 명세 (Gemini/Grok 협업 결과)
- `ARCH.md`: 시스템 아키텍처 및 모노레포 구조 설계
- `SCHEMA.md`: DB 모델링 및 Prisma 스키마 설계
- `FE_DEV.md` / `BE_DEV.md`: 프론트엔드 및 백엔드 개발 명세 (작성 예정)

### 2. 히스토리 기록 및 오류 추적 (/docs/history)
날짜별로 모든 활동과 발생한 오류를 기록하여 컨텍스트를 유지합니다.
- **형식**: `/docs/history/YYYY-MM-DD.md`
- **포함 내용**:
  - `[작업 내용]`: 오늘 수행한 구체적인 개발 사항.
  - `[오류 기록]`: 발생한 에러 로그, 원인 분석, 해결 방법 (Troubleshooting).
  - `[결과 확인]`: 코드 실행 결과 및 정상 동작 확인 여부.

## 🌿 Git Workflow & Commit Convention
표준 Git-Flow와 직관적인 커밋 메시지 형식을 따릅니다.

### 1. Branch Strategy
- `master`: 제품 출시 가능한 상태의 안정된 브랜치.
- `develop`: 다음 출시 버전을 개발하는 통합 브랜치.
- `feature/기능명`: **작업마다 새 브랜치 생성** (develop에서 분기).
- `hotfix/이슈명`: 긴급 오류 수정 브랜치 (master에서 분기).

### 2. Commit Message Format
`타입(범위): [날짜] 내용` 형식을 사용합니다.
- **타입**: `feat`(기능), `fix`(버그), `docs`(문서), `refactor`(리팩토링), `chore`(설정)
- **예시**: `feat(auth): [2026-03-08] 소셜 로그인 기능 구현 및 PLAN.md 업데이트`

## 🚀 Development Execution Principles
- **Zero-Error Policy**: 모든 코드는 푸시 전 로컬 실행을 통해 오류 없음을 검증해야 함.
- **Context Sync**: 새로운 세션 시작 시 반드시 `/docs` 내의 모든 `.md` 파일을 읽어 이전 진행 상황을 완벽히 파악함.
- **Auto Reporting**: 작업 완료 후 반드시 `./notify.sh`를 통해 슬랙으로 알림을 전송함.
- **Branch per Task**: 작업마다 `feature/작업명` 브랜치를 생성하고, 완료 후 develop에 머지.

## 💻 CLI Commands
```bash
# 패키지 설치 (반드시 yarn 사용)
yarn install

# 개발 서버 실행
yarn start  # 모든 패키지 동시 실행 (lerna)

# 슬랙 알림 (프로젝트 루트)
./notify.sh "[2026-03-08] FE 아키텍처 설계 완료"

# Git 브랜치 생성 및 커밋
git checkout -b feature/기능명
git add <파일>
git commit -m "feat(범위): [날짜] 작업 내용"
git push origin feature/기능명

# develop 머지 (PR 권장)
git checkout develop
git merge feature/기능명
git push origin develop
```
