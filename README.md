# Cert-Quiz-App

자격증 시험 준비를 위한 **AI 학습 및 랜덤 문제 출제 서비스**

PDF 업로드 → AI 자동 문제 추출 → 랜덤 출제 → 자동 채점 → 상세 해설

---

## 패키지 구조

```
packages/
├── host/           # Next.js 14 — FE 메인 쉘 (Module Federation Host, port 4000)
├── remote/         # Next.js 14 — FE 원격 모듈 (Module Federation Remote, port 4001)
├── api/            # NestJS    — BE REST API (port 4010) [예정]
├── client-common/  # 공유 FE 라이브러리
└── server-common/  # 공유 BE 라이브러리
```

---

## 시작하기

### 환경 요구사항

- Node.js >= 20.0.0
- Yarn >= 4.0.0

### 설치

```bash
yarn install
```

### 환경변수 설정

```bash
# .env.local 파일 생성 후 실제 시크릿 값 입력
cp .env.development .env.local
# .env.local 편집: SLACK_WEBHOOK_URL, DATABASE_URL, JWT_SECRET 등
```

### 개발 서버 실행

```bash
# 전체 패키지 동시 실행
yarn start

# 개별 패키지 실행
cd packages/host && yarn start     # http://localhost:4000
cd packages/remote && yarn start   # http://localhost:4001
```

### Docker 실행

```bash
docker compose up -d --build
```

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 14, React 18, Recoil, SCSS |
| Micro Frontend | Module Federation (@module-federation/nextjs-mf) |
| 백엔드 | NestJS (예정), Express (현재) |
| 데이터베이스 | MariaDB + Prisma ORM |
| AI | Claude API / Google Gemini API |
| 인프라 | Docker, Nginx |
| 패키지 관리 | Yarn 4 Workspaces + Lerna |

---

## 문서

| 파일 | 내용 |
|------|------|
| [CLAUDE.md](./CLAUDE.md) | Claude Code 작업 가이드 |
| [docs/PLAN.md](./docs/PLAN.md) | 기능 기획안 및 로드맵 |
| [docs/ARCH.md](./docs/ARCH.md) | 시스템 아키텍처 설계 |
| [docs/SCHEMA.md](./docs/SCHEMA.md) | DB 스키마 설계 |
| [docs/history/](./docs/history/) | 날짜별 작업 이력 |

---

## Git 브랜치 전략

```
master        ← 안정된 배포 브랜치
  └── develop ← 통합 개발 브랜치
        └── feature/기능명 ← 작업마다 새 브랜치 생성
```

커밋 형식: `타입(범위): [YYYY-MM-DD] 내용`

---

## Slack 알림

```bash
./notify.sh "[2026-03-08] 작업 완료 메시지"
```
