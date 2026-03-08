#!/usr/bin/env claude-run
# ARCH.md — 시스템 아키텍처, 모노레포 구조 설계 및 다중 모델 오케스트레이션

> 실행: `bash scripts/claude-run.sh docs/ARCH.md`

---

## 1. 모노레포 패키지 구조 (Grok 모드 — 최신 트렌드 반영)

> **Grok 역할**: 실시간 기술 트렌드를 반영한 모노레포 구조 최적화
> Turborepo 기반 빌드 캐싱 + Nx 태스크 그래프 하이브리드 전략 적용

```
cert-quiz-app/                    # Yarn 4 Workspaces + Lerna 8 + Turborepo
├── packages/
│   ├── host/                     # Next.js 14 — FE 메인 쉘 (port 4000)
│   │   └── [Module Federation Host]
│   │
│   ├── remote/                   # Next.js 14 — FE 원격 모듈 (port 4001)
│   │   └── [Module Federation Remote, exposes: Test, Edit]
│   │
│   ├── api/                      # NestJS 10 — REST API (port 4010) [Phase 1]
│   │   ├── src/
│   │   │   ├── auth/             # JWT 인증 (Passport.js)
│   │   │   ├── quiz/             # 퀴즈 출제/채점
│   │   │   ├── upload/           # PDF 업로드 (Multer)
│   │   │   ├── ai/               # AI 오케스트레이터 (Claude/Gemini/Grok)
│   │   │   └── prisma/           # Prisma 서비스
│   │   └── prisma/schema.prisma
│   │
│   ├── crawler/                  # Playwright 크롤러 [Phase 1]
│   │   ├── src/
│   │   │   ├── comcbt.crawler.ts # comcbt.com 자동화 크롤러
│   │   │   ├── parser/           # HWP/PDF 파서
│   │   │   └── sync.ts           # 동기화 스케줄러
│   │   └── package.json
│   │
│   ├── client-common/            # 공유 FE 라이브러리
│   └── server-common/            # 공유 BE 라이브러리
│
├── data/                         # 버전 관리형 데이터 저장소
│   ├── registry.json             # 시험 목록 레지스트리
│   ├── checksums.json            # 파일 해시 (중복 방지)
│   ├── parsed/                   # 구조화된 문제 JSON
│   └── changelog/                # 변경 이력
│
├── scripts/                      # 자동화 스크립트
│   ├── claude-run.sh             # Executable Markdown 실행기
│   ├── ship.sh                   # 푸시+검증+Slack 통합
│   ├── verify.sh                 # 서버 헬스체크
│   ├── review.sh                 # AI 리뷰 기록
│   └── sync-data.sh              # 데이터 동기화 [Phase 1]
│
├── docs/                         # 설계 문서 (Executable Markdown)
├── .env.development              # 개발 환경 (git tracked, 시크릿 없음)
├── .env.production               # 운영 환경 (git tracked, 시크릿 없음)
└── .env.local                    # 실제 시크릿 (gitignored)
```

### Grok 추천 최적화 포인트

| 항목 | 현재 | Grok 권장 | 이유 |
|------|------|-----------|------|
| 빌드 도구 | Lerna | Lerna + Turborepo | 빌드 캐싱으로 CI 70% 단축 |
| 타입 안전성 | JavaScript | TypeScript (점진적 전환) | 2024년 표준, API 타입 공유 |
| 상태관리 | Recoil | Jotai or Zustand | Recoil 유지보수 중단 위험 |
| API 스타일 | REST | REST + tRPC (내부) | FE-BE 타입 공유 자동화 |
| ORM | Prisma (계획) | Prisma + DrizzleORM 비교 검토 | Drizzle: 더 빠른 쿼리 성능 |

---

## 2. Module Federation 아키텍처

```
[Browser]
    │
    ▼
[host:4000]  ← Next.js Shell
    │ Module Federation
    ├──→ [remote:4001]/remoteEntry.js
    │         exposes: ./Test, ./Edit
    │
    ▼
[api:4010]   ← NestJS REST + AI 오케스트레이터
    │
    ├── Claude API (문제 해설, 품질 검증)
    ├── Gemini API (UI/UX 분석, 공간 추론)
    ├── Grok API (트렌드 분석, 최신 기술 반영)
    │
    ▼
[MariaDB:3306]
```

---

## 3. 다중 모델 오케스트레이션 (Multi-Model Orchestration)

### 3.1 모델별 역할 분담

| 모델 | 제공사 | 역할 | 사용 시점 |
|------|--------|------|----------|
| **Claude** (Sonnet) | Anthropic | 코드 생성, 문제 해설, AI 리뷰 | 핵심 AI 작업 전반 |
| **Gemini** (1.5 Pro) | Google | UI/UX 설계, 이미지 분석, OCR 보정 | 프론트엔드 설계, PDF 이미지 처리 |
| **Grok** (3) | xAI | 최신 트렌드 반영, 기술 검증 | 아키텍처 리뷰, 기술 선택 |

### 3.2 API Key 설정 (.env.local)

실제 시크릿은 반드시 `.env.local`에만 저장합니다 (gitignored).

```bash
# .env.local (gitignored — 절대 커밋 금지)

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-...

# Google (Gemini)
GOOGLE_API_KEY=AIza...
GEMINI_MODEL=gemini-1.5-pro

# xAI (Grok)
XAI_API_KEY=xai-...
GROK_MODEL=grok-3

# 토큰 비용 알림 임계값 (USD)
AI_COST_ALERT_THRESHOLD=5.00
```

`.env.development` / `.env.production`에는 플레이스홀더만:
```bash
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key
XAI_API_KEY=your-xai-key
```

### 3.3 토큰 비용 관리

#### 모델별 비용 (2026년 기준)

| 모델 | Input (1M tokens) | Output (1M tokens) | 용도 |
|------|------------------|-------------------|------|
| Claude Sonnet 4.6 | $3.00 | $15.00 | 해설 생성, 코드 리뷰 |
| Gemini 1.5 Pro | $3.50 | $10.50 | UI 분석, OCR 보정 |
| Grok 3 | ~$5.00 | ~$15.00 | 트렌드 분석 |

#### 비용 절감 전략

```
1. 캐싱: 동일 문제 해설 요청 → Redis 캐시 우선 조회
2. 배치 처리: 해설 생성을 단건이 아닌 10문제 단위로 묶어 요청
3. 모델 선택: 단순 작업 → Claude Haiku (저비용), 복잡 작업 → Sonnet
4. 프롬프트 최적화: 시스템 프롬프트 캐싱 (Anthropic Beta feature)
5. 예산 알림: 일일 $5 초과 시 Slack 경고 자동 전송
```

#### AI 비용 추적 구조

```typescript
// packages/api/src/ai/cost-tracker.service.ts
interface TokenUsage {
  model: 'claude' | 'gemini' | 'grok';
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  purpose: string;     // 'explanation' | 'review' | 'ocr' | 'trend'
  timestamp: Date;
}
// DB에 기록 → 일/월별 비용 집계 → 임계값 초과 시 Slack 알림
```

### 3.4 Gemini 모드 — UI/UX 및 반응형 레이아웃 설계

> **Gemini 역할**: 공간적 추론을 통한 UI/UX 설계 + 반응형 레이아웃

#### 퀴즈 화면 레이아웃 설계안

```
Desktop (≥1024px)               Tablet (768-1023px)         Mobile (<768px)
┌──────┬──────────────┐         ┌──────────────────┐        ┌──────────────┐
│ Nav  │  문제 영역    │         │   문제 영역       │        │ 문제 영역    │
│      │              │         │   ──────────────  │        │ ──────────   │
│      │ ①②③④ 선지  │   →     │  ①②③④ 선지    │   →   │ ①②③④      │
│      │              │         │                   │        │              │
│      │ [진행바]      │         │ [진행바]          │        │ [진행]       │
└──────┴──────────────┘         └──────────────────┘        └──────────────┘

컴포넌트 계층:
QuizLayout
  ├── QuizProgress (타이머, 진행률)
  ├── QuestionCard
  │     ├── QuestionText (마크다운 지원)
  │     ├── OptionList
  │     └── ImageContainer (그림 문제)
  └── QuizNavigation (이전/다음/제출)
```

#### Tailwind CSS 반응형 전략

```
- sm(640px): 단일 컬럼, 풀 너비 선지
- md(768px): 사이드바 고정, 2컬럼 선지 가능
- lg(1024px): 전체 레이아웃, 오답노트 사이드바
- 다크모드: class 기반 (tailwind dark:)
```

---

## 4. 환경변수 관리 전략

| 파일 | 용도 | git 추적 | 포함 내용 |
|------|------|----------|----------|
| `.env.development` | 개발 URL/포트 | ✅ | localhost URL, 포트, placeholder key |
| `.env.production` | 운영 URL/포트 | ✅ | 실서버 URL, 포트, placeholder key |
| `.env.local` | 실제 시크릿 | ❌ | API Key, DB URL, JWT Secret, Webhook |

<!-- run env 플레이스홀더 최신화 확인 -->
```bash
COUNT=$(grep -c "your-" .env.local 2>/dev/null || echo 0)
echo "✅ .env.development 플레이스홀더 ${COUNT}개 확인 (실제 시크릿은 .env.local에)"
```

---

## 5. 포트 할당

| 서비스 | 포트 | 역할 |
|--------|------|------|
| host (Next.js) | 4000 | FE 메인 쉘 |
| remote (Next.js) | 4001 | FE MF 원격 모듈 |
| api (NestJS) | 4010 | BE REST API |
| crawler (Node.js) | - | 백그라운드 프로세스 |
| MariaDB | 3306 | 데이터베이스 |
| Redis | 6379 | AI 응답 캐시 |
| Nginx | 80 / 443 | 리버스 프록시 |

---

## 6. 기술 부채 현황

| 항목 | 상태 | 우선순위 |
|------|------|----------|
| `packages/server` → `packages/api` NestJS 교체 | Phase 1 | High |
| Recoil → Jotai 마이그레이션 | 검토 중 | Medium |
| Pages Router → App Router | Phase 4 | Medium |
| TypeScript 도입 (api, crawler부터) | Phase 1 | High |
| SCSS → Tailwind CSS | Phase 4 | Low |
| npm audit 취약점 (45건) | 운영 전 | Medium |
