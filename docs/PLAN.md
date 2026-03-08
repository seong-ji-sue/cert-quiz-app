# PLAN.md — 자격증 AI 학습 앱 기능 기획안

## 1. 프로젝트 개요

**서비스명**: Cert-Quiz-App
**목표**: PDF 업로드 → AI 문제 자동 추출 → 랜덤 출제 → 자동 채점 → 상세 해설 제공
**대상 사용자**: 자격증 시험 준비생

---

## 2. 핵심 기능 명세

### 2.1 PDF 업로드 및 문제 추출
- 사용자가 자격증 교재(PDF)를 업로드
- AI(Claude API 또는 Google Gemini)가 텍스트 파싱 후 문제/선지/정답/해설 구조로 자동 추출
- 추출된 문제는 MariaDB에 저장 (Prisma ORM)
- 지원 포맷: PDF, 향후 이미지(OCR) 확장 예정

### 2.2 문제 관리
- 자격증 카테고리별 문제 분류 (예: 정보처리기사, 네트워크관리사 등)
- 문제 CRUD (생성·조회·수정·삭제)
- 문제 난이도 태깅 (하/중/상)
- 출제 여부 및 정답률 통계 제공

### 2.3 랜덤 문제 출제 (퀴즈 모드)
- 카테고리·난이도·문항 수 선택 후 랜덤 출제
- 타이머 기반 시험 모드 지원
- 객관식(4지선다), 주관식 형태 지원

### 2.4 자동 채점 및 해설
- 제출 즉시 채점 결과 반환
- 오답 문제에 대해 AI 생성 상세 해설 제공
- 학습 이력(시도 횟수, 정답률) 기록

### 2.5 사용자 학습 이력
- 회원 가입/로그인 (JWT 기반)
- 풀었던 문제 이력, 틀린 문제 모아보기
- 학습 진도 대시보드 (주간/월간 통계)

---

## 3. 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 14 (Pages Router → App Router 마이그레이션 예정) |
| 상태관리 | Recoil |
| 스타일 | Tailwind CSS (SCSS에서 마이그레이션 예정) |
| 백엔드 | NestJS (Express에서 마이그레이션 예정) |
| DB | MariaDB + Prisma ORM |
| AI | Claude API / Google Gemini API |
| PDF 파싱 | pdf-parse, pdf2pic |
| 인증 | JWT (AccessToken + RefreshToken) |
| 인프라 | Docker, Nginx |

---

## 4. 개발 단계 (Roadmap)

### Phase 1 — 기반 구조 정립 (현재)
- [x] 모노레포 구조 정리 및 기술 부채 해소
- [x] 설계 문서 작성 (PLAN/ARCH/SCHEMA)
- [ ] NestJS 백엔드 패키지(`packages/api`) 생성
- [ ] Prisma 스키마 초기 설정 및 마이그레이션

### Phase 2 — 핵심 기능 구현
- [ ] 사용자 인증 (회원가입/로그인/JWT)
- [ ] PDF 업로드 API
- [ ] AI 문제 추출 파이프라인
- [ ] 문제 CRUD API

### Phase 3 — 퀴즈 및 학습 기능
- [ ] 랜덤 출제 엔진
- [ ] 자동 채점 로직
- [ ] 학습 이력 저장 및 조회

### Phase 4 — UI/UX 및 배포
- [ ] Next.js App Router 마이그레이션
- [ ] Tailwind CSS 적용
- [ ] Docker 프로덕션 빌드 최적화
- [ ] CI/CD 파이프라인 구성
