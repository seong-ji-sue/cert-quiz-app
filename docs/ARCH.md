# ARCH.md — 시스템 아키텍처 및 모노레포 구조 설계

## 1. 현재 모노레포 구조

```
cert-quiz-app/                    # Yarn 4 Workspaces + Lerna 모노레포
├── packages/
│   ├── host/                     # Next.js 14 — FE 메인 쉘 (Module Federation Host)
│   │   ├── src/
│   │   │   ├── pages/            # Pages Router (index, auth/authorized)
│   │   │   ├── components/       # Layout, Nav, Header
│   │   │   ├── provider/         # PublicProvider, PrivateProvider
│   │   │   └── contents/         # nav 정적 데이터
│   │   ├── next.config.js        # Module Federation Host 설정
│   │   └── server.mjs            # Express + Next.js 커스텀 서버 (port 4000)
│   │
│   ├── remote/                   # Next.js 14 — FE 원격 모듈 (Module Federation Remote)
│   │   ├── src/
│   │   │   ├── pages/            # 노출 컴포넌트 (Test, Edit)
│   │   │   └── components/       # Editor, EditorPanel, PreviewPanel
│   │   ├── next.config.js        # Module Federation Remote 설정 (exposes)
│   │   └── server.mjs            # Express + Next.js 커스텀 서버 (port 4001)
│   │
│   ├── api/                      # NestJS — BE REST API [생성 예정, Phase 1]
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── auth/             # JWT 인증 모듈
│   │   │   ├── quiz/             # 퀴즈 출제/채점 모듈
│   │   │   ├── upload/           # PDF 업로드 모듈
│   │   │   ├── ai/               # Claude/Gemini AI 연동 모듈
│   │   │   └── prisma/           # Prisma 서비스
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   │
│   ├── client-common/            # 공유 FE 라이브러리 (@nextpr/client-common)
│   │   └── src/
│   │       ├── api/              # BFF API 엔드포인트 상수
│   │       ├── axios/            # Axios 인스턴스
│   │       ├── components/       # 공통 컴포넌트 (Toast 등)
│   │       ├── store/            # Recoil 상태 (auth, nav)
│   │       ├── contents/         # 정적 콘텐츠 (URL, title)
│   │       └── styles/           # 전역 SCSS
│   │
│   ├── server-common/            # 공유 BE 라이브러리 (@nextpr/server-common)
│   │   └── src/
│   │       ├── controllers/      # BFF 컨트롤러 (auth, test)
│   │       ├── middleware/       # 공통 미들웨어
│   │       ├── apis/             # 외부 API 호출 함수
│   │       └── utils/            # 공통 유틸 (methods, func, convertor)
│   │
│   └── server/                   # Express 레거시 BE [→ packages/api로 교체 예정]
│       └── index.js
│
├── docs/                         # 설계 문서 (PLAN, ARCH, SCHEMA, history)
├── docker/                       # Dockerfile (host, remote)
├── certificates/                 # SSL 인증서 (gitignored 권장)
├── .env.development              # 개발 환경변수 (git tracked, 실제 시크릿 제외)
├── .env.production               # 운영 환경변수 (git tracked, 실제 시크릿 제외)
├── .env.local                    # 실제 시크릿 (gitignored)
├── nginx.conf                    # Nginx 리버스 프록시
├── docker-compose.yml            # 컨테이너 오케스트레이션
├── lerna.json                    # Lerna 설정 (npmClient: yarn)
└── package.json                  # 루트 (packageManager: yarn@4.13.0)
```

---

## 2. Module Federation (Micro Frontend) 아키텍처

```
[Browser]
    │
    ▼
[host:4000]  ← Next.js Shell (Layout, Nav, Auth 처리)
    │
    ├── 동적 로드 → [remote:4001]/static/chunks/remoteEntry.js
    │                   ├── expose: ./Test  → src/pages/index.js
    │                   └── expose: ./Edit  → src/pages/test/index.js
    │
    ▼
[api:4010]   ← NestJS REST API (JWT 인증, 퀴즈, PDF 처리)
    │
    ▼
[MariaDB:3306] ← Prisma ORM
```

**공유 싱글톤 모듈**: `react`, `recoil`, `next/router`, `next/navigation`

---

## 3. 환경변수 관리 전략

| 파일 | 용도 | git 추적 |
|------|------|----------|
| `.env.development` | 개발 환경 URL/포트 설정 | ✅ tracked |
| `.env.production` | 운영 환경 URL/포트 설정 | ✅ tracked |
| `.env.local` | 실제 시크릿 (API Key, Webhook URL 등) | ❌ gitignored |
| `.env.local` override | 특정 환경에서 값 덮어쓰기 | ❌ gitignored |

실제 민감한 값(.env.local 예시):
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/REAL/WEBHOOK/URL
CLAUDE_API_KEY=real-api-key
DATABASE_URL=mysql://user:password@host:3306/db
JWT_SECRET=real-jwt-secret
```

---

## 4. 포트 할당

| 서비스 | 포트 | 역할 |
|--------|------|------|
| host (Next.js) | 4000 | FE 메인 쉘 |
| remote (Next.js) | 4001 | FE MF 원격 모듈 |
| api (NestJS) | 4010 | BE REST API |
| MariaDB | 3306 | 데이터베이스 |
| Nginx | 80 / 443 | 리버스 프록시 |

---

## 5. 기술 부채 현황

| 항목 | 상태 | 우선순위 |
|------|------|----------|
| `packages/server` → `packages/api` (NestJS) 교체 | Phase 1 예정 | High |
| Pages Router → App Router 마이그레이션 | Phase 4 예정 | Medium |
| SCSS → Tailwind CSS 마이그레이션 | Phase 4 예정 | Low |
| `babel-eslint` → `@babel/eslint-parser` 교체 | 추후 | Low |
| npm audit 취약점 대응 (45건) | 운영 전 필수 | Medium |
