# ARCH.md — 시스템 아키텍처 및 모노레포 구조 설계

## 1. 현재 모노레포 구조 분석

```
cert-quiz-app/                    # Yarn Workspaces + Lerna 모노레포
├── packages/
│   ├── host/                     # Next.js 14 — 메인 쉘 (MF Host)
│   │   ├── src/pages/            # Pages Router
│   │   ├── next.config.js        # Module Federation (Host)
│   │   └── server.mjs            # Express + Next.js 커스텀 서버
│   │
│   ├── remote/                   # Next.js 14 — 원격 모듈 (MF Remote)
│   │   ├── src/pages/            # 노출 컴포넌트 (Test, Edit)
│   │   ├── next.config.js        # Module Federation (Remote, exposes)
│   │   └── server.mjs            # Express + Next.js 커스텀 서버
│   │
│   ├── client-common/            # 공유 FE 라이브러리
│   │   └── src/
│   │       ├── api/              # BFF API 엔드포인트 상수
│   │       ├── axios/            # Axios 인스턴스
│   │       ├── components/       # 공통 컴포넌트 (Toast 등)
│   │       ├── store/            # Recoil 상태 (auth, nav)
│   │       ├── contents/         # 정적 콘텐츠 (URL, title)
│   │       └── styles/           # 전역 SCSS
│   │
│   ├── server-common/            # 공유 BE 라이브러리 (Next.js API Route용)
│   │   └── src/
│   │       ├── controllers/      # BFF 컨트롤러 (auth, test)
│   │       ├── middleware/       # 공통 미들웨어
│   │       ├── apis/             # 외부 API 호출 함수
│   │       └── utils/            # 공통 유틸 (methods, func, convertor)
│   │
│   └── server/                   # Express 레거시 백엔드 (→ NestJS로 교체 예정)
│       └── index.js              # 기본 Express 서버 (port 4010)
│
├── docs/                         # 설계 문서
├── docker/                       # Dockerfile (host, remote)
├── certificates/                 # SSL 인증서
├── .env.development              # 개발 환경변수
├── .env.production               # 프로덕션 환경변수
├── nginx.conf                    # Nginx 리버스 프록시
├── docker-compose.yml            # 컨테이너 오케스트레이션
└── lerna.json                    # Lerna 설정 (npmClient: yarn)
```

---

## 2. Module Federation 아키텍처

현재 프로젝트는 **Micro Frontend** 패턴을 적용하고 있습니다.

```
[Browser]
    │
    ▼
[host:4000]  ← Next.js Shell (Layout, Nav, Auth)
    │
    ├── 동적 로드 → [remote:4001]/remoteEntry.js
    │                   ├── expose: ./Test  (src/pages/index.js)
    │                   └── expose: ./Edit  (src/pages/test/index.js)
    │
    ▼
[server:4010]  ← Express BFF / 향후 NestJS API
    │
    ▼
[MariaDB]  ← 데이터베이스 (Prisma ORM)
```

**공유 싱글톤**: `react`, `recoil`, `next/router`, `next/navigation`

---

## 3. 향후 NestJS 백엔드 배치 설계

### 3.1 새 패키지 구조 (packages/api)
```
packages/api/                     # NestJS 백엔드
├── src/
│   ├── app.module.ts
│   ├── main.ts                   # 엔트리포인트 (port 4010)
│   ├── auth/                     # 인증 모듈 (JWT)
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── dto/
│   ├── quiz/                     # 퀴즈 모듈
│   │   ├── quiz.module.ts
│   │   ├── quiz.controller.ts
│   │   ├── quiz.service.ts
│   │   └── dto/
│   ├── upload/                   # PDF 업로드 모듈
│   │   ├── upload.module.ts
│   │   ├── upload.controller.ts
│   │   └── upload.service.ts
│   ├── ai/                       # AI 연동 모듈 (Claude/Gemini)
│   │   ├── ai.module.ts
│   │   └── ai.service.ts
│   └── prisma/                   # Prisma 서비스
│       └── prisma.service.ts
├── prisma/
│   └── schema.prisma             # DB 스키마
└── package.json
```

### 3.2 NestJS 마이그레이션 계획
1. `packages/api` 디렉터리 생성 및 NestJS 프로젝트 초기화
2. `packages/server` Express 코드를 NestJS 모듈로 이식
3. Prisma 스키마 정의 및 마이그레이션 실행
4. `docker-compose.yml`에 `api` 서비스 및 `mariadb` 서비스 추가

---

## 4. 포트 할당 계획

| 서비스 | 포트 | 역할 |
|--------|------|------|
| host (Next.js) | 4000 | 메인 FE 쉘 |
| remote (Next.js) | 4001 | 원격 모듈 MF |
| api (NestJS) | 4010 | REST API 백엔드 |
| MariaDB | 3306 | 데이터베이스 |
| Nginx | 80/443 | 리버스 프록시 |

---

## 5. 기술 부채 현황

| 항목 | 상태 | 우선순위 |
|------|------|----------|
| `packages/server` — Express → NestJS 교체 | 계획됨 | High |
| Pages Router → App Router 마이그레이션 | 계획됨 | Medium |
| SCSS → Tailwind CSS 마이그레이션 | 계획됨 | Low |
| `packages/server-common` TypeScript 전환 | 계획됨 | Medium |
| `babel-eslint` → `@babel/eslint-parser` 교체 | 계획됨 | Low |
| 취약점 45건 (npm audit) | 대응 필요 | Medium |
