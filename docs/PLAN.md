#!/usr/bin/env claude-run
# PLAN.md — 자격증 AI 학습 앱 기능 기획안 + 데이터 파이프라인 설계

> 실행: `bash scripts/claude-run.sh docs/PLAN.md`

---

## 1. 프로젝트 개요

**서비스명**: Cert-Quiz-App
**목표**: PDF 업로드 / comcbt.com 크롤링 → AI 문제 추출 → 랜덤 출제 → 자동 채점 → 상세 해설
**1차 타겟 자격증**: 정보처리기사, 컴퓨터활용능력 1·2급, 네트워크관리사 2급

---

## 2. 핵심 기능 명세

### 2.1 데이터 수집 (이중 채널)

| 채널 | 방식 | 상태 |
|------|------|------|
| PDF 업로드 | 사용자 직접 업로드 → OCR 파싱 | Phase 2 |
| comcbt.com 크롤링 | Playwright 자동화 → 구조화 저장 | Phase 1 (핵심) |

### 2.2 퀴즈 기능
- 카테고리 / 연도 / 난이도 필터 랜덤 출제
- 타이머 모드, 모의고사 모드
- 즉시 채점 + AI 해설 (Claude API)

### 2.3 학습 이력
- 풀이 기록, 오답 노트, 진도 대시보드

---

## 3. ComCBT 데이터 자동화 파이프라인 (핵심)

### 3.1 comcbt.com 구조 분석 결과

```
베이스 URL: https://www.comcbt.com
CMS: XpressEngine (XE)

카테고리 목록 페이지:
  정보처리기사       → /xe/iz
  컴퓨터활용능력 1급 → /xe/c1
  컴퓨터활용능력 2급 → /xe/c2
  네트워크관리사 2급 → /xe/jf
  워드프로세서       → /xe/w1

시험지 상세 URL: /xe/{category}/{document_srl}
예) https://www.comcbt.com/xe/iz/5851061

파일 다운로드:
  /xe/?module=file&act=procFileDownload&file_srl={srl}&sid={token}&module_srl={msrl}
  ⚠️ SID는 세션 기반 임시 토큰 → 반드시 브라우저 세션 유지 필요
```

### 3.2 크롤링 전략 — Playwright (Browser Automation)

#### 왜 Playwright인가?
- comcbt.com 파일 다운로드에 **세션 쿠키 + SID 토큰** 필요
- 단순 curl/requests 로는 다운로드 불가 (403 반환)
- Playwright가 실제 브라우저처럼 동작하여 세션 유지

#### 크롤링 흐름

```
[Playwright 브라우저 세션]
    │
    ▼
1. 카테고리 목록 페이지 접근 (/xe/{category})
    │
    ▼
2. 시험 목록 추출 (document_srl, 시험명, 연도, 회차)
    │
    ▼
3. 각 시험 상세 페이지 방문
    │
    ▼
4. 파일 다운로드 링크 수집 (file_srl, sid 포함)
    │
    ▼
5. 파일 다운로드 (HWP/PDF/DOCX)
    │
    ▼
6. 다운로드 파일 → 텍스트 파싱 → JSON 구조화
    │
    ▼
7. 버전 관리형 데이터 저장소 저장
```

#### packages/crawler 구현 계획

```typescript
// packages/crawler/src/comcbt.crawler.ts
interface ExamMeta {
  category: string;     // 'iz' | 'c1' | 'c2' | 'jf'
  examName: string;     // '정보처리기사'
  year: number;         // 2022
  round: number;        // 1 | 2 | 3 | 4
  documentSrl: number;  // 5851061
  downloadUrl: string;
  collectedAt: string;  // ISO datetime
}

// Playwright로 세션 유지하며 순차 크롤링
// Rate limit: 1 req/3sec (comcbt 서버 부하 방지)
// 실패 시 최대 3회 재시도 with exponential backoff
```

### 3.3 버전 관리형 데이터 저장소 구조

```
data/
├── registry.json                   ← 전체 시험 목록 + 수집 메타데이터
├── checksums.json                  ← 파일 해시 (중복 방지)
│
├── raw/                            ← 원본 다운로드 파일 (gitignored)
│   └── {category}/{year}-{round}/
│       ├── questions.hwp           ← 원본 HWP
│       └── answers.hwp
│
├── parsed/                         ← 파싱된 JSON (git tracked)
│   └── {category}/{year}-{round}/
│       ├── metadata.json           ← 시험 메타데이터
│       └── questions.json          ← 구조화된 문제 배열
│
└── changelog/                      ← 변경 이력
    └── YYYY-MM-DD.json             ← 당일 추가/변경된 시험 목록
```

#### registry.json 형식

```json
{
  "version": "1.0.0",
  "lastSync": "2026-03-08T00:00:00Z",
  "categories": {
    "iz": {
      "name": "정보처리기사",
      "url": "https://www.comcbt.com/xe/iz",
      "exams": [
        {
          "documentSrl": 5851061,
          "year": 2022,
          "round": 2,
          "title": "정보처리기사 필기 기출문제 및 CBT 2022년 04월 24일(2회)",
          "questionCount": 100,
          "hasAnswers": true,
          "parsedAt": "2026-03-08T00:00:00Z",
          "fileHash": "sha256:abc123..."
        }
      ]
    }
  }
}
```

#### questions.json 형식

```json
{
  "meta": {
    "category": "iz",
    "examName": "정보처리기사",
    "year": 2022,
    "round": 2,
    "totalQuestions": 100,
    "subjects": ["소프트웨어 설계", "소프트웨어 개발", "데이터베이스 구축", "프로그래밍 언어 활용", "정보시스템 구축 관리"]
  },
  "questions": [
    {
      "id": "iz-2022-2-001",
      "number": 1,
      "subject": "소프트웨어 설계",
      "content": "문제 내용...",
      "options": ["①...", "②...", "③...", "④..."],
      "answer": 3,
      "explanation": "해설...",
      "difficulty": "medium",
      "tags": ["UML", "다이어그램"]
    }
  ]
}
```

### 3.4 자동 동기화 파이프라인 (Sync Pipeline)

```
[스케줄러: 매주 월요일 02:00 KST]
    │
    ▼
scripts/sync-data.sh 실행
    ├── 1. registry.json 로드
    ├── 2. comcbt.com 최신 목록 크롤링
    ├── 3. 신규/변경 시험 식별 (documentSrl 비교)
    ├── 4. 신규 파일만 선택 다운로드
    ├── 5. 파싱 → questions.json 업데이트
    ├── 6. registry.json 갱신
    ├── 7. changelog/오늘날짜.json 생성
    └── 8. git commit + push (data 브랜치)
```

<!-- run 데이터 저장소 초기화 -->
```bash
mkdir -p data/raw data/parsed data/changelog
echo '{"version":"1.0.0","lastSync":null,"categories":{}}' > data/registry.json
echo '{}' > data/checksums.json
echo "✅ 데이터 저장소 초기화 완료"
```

---

## 4. PDF 분석 전략

### 4.1 현재 상태

프로젝트 내 PDF 파일: **없음** (certificates/ 폴더에 SSL PEM 파일만 존재)
→ 사용자 업로드 또는 comcbt 다운로드를 통한 수집 필요

### 4.2 PDF 파싱 파이프라인

```
[PDF 입력]
    │
    ▼
1단계: pdf-parse (텍스트 직접 추출)
  - 디지털 PDF: 바로 텍스트 추출 가능
  - 스캔 PDF: 다음 단계로 이동
    │
    ▼
2단계: Tesseract OCR (스캔 이미지 처리)
  - pdf2pic으로 페이지별 이미지 변환
  - tesseract-ocr로 한국어 텍스트 인식 (kor+eng)
    │
    ▼
3단계: 문제 구조 파싱 (정규식 + AI)
  패턴: /^(\d+)\.\s+(.+?)(?=\d+\.|\Z)/ms
  선지: /[①②③④]\s*(.+)/
  정답: /정답\s*[:：]\s*([①②③④\d])/
    │
    ▼
4단계: AI 보정 (Claude API)
  - OCR 오류 수정
  - 선지-문제 매핑 검증
  - 해설 생성 (없는 경우)
    │
    ▼
5단계: questions.json 저장
```

#### 패키지 설치 계획

```bash
# packages/api 에서 설치
yarn add pdf-parse pdf2pic tesseract.js sharp
# 시스템 패키지
apt-get install -y tesseract-ocr tesseract-ocr-kor
echo "PDF 분석 도구 설치 계획 확인"
```

### 4.3 HWP 파싱 전략 (comcbt 특화)

comcbt.com의 주요 파일 형식은 **HWP** (한글 워드프로세서)

```
방안 1: hwpjs (npm) - 순수 JS HWP 파서
방안 2: LibreOffice 변환 → HWP → DOCX → 텍스트 추출
방안 3: hwp2text (Python) 라이브러리

권장: 방안 2 (변환 품질 최고, Docker 환경에서 실행 가능)
```

---

## 5. 개발 로드맵 (업데이트)

### Phase 1 — 데이터 파이프라인 (현재 ~ 4주)
- [ ] `packages/crawler` — Playwright 크롤러 구현
- [ ] `data/` 버전 관리형 저장소 초기화
- [ ] comcbt.com 카테고리별 첫 수집 실행
- [ ] HWP/PDF 파싱 로직 구현
- [ ] `packages/api` NestJS 백엔드 골격 생성
- [ ] Prisma 스키마 마이그레이션

### Phase 2 — 핵심 API (4~8주)
- [ ] 사용자 인증 (JWT)
- [ ] 문제 CRUD API
- [ ] PDF 업로드 API
- [ ] AI 해설 생성 API (Claude)

### Phase 3 — 퀴즈 기능 (8~12주)
- [ ] 랜덤 출제 엔진
- [ ] 자동 채점
- [ ] 오답 노트

### Phase 4 — UI/UX 완성 (12~16주)
- [ ] Next.js App Router 마이그레이션
- [ ] Tailwind CSS 적용
- [ ] 모바일 반응형
