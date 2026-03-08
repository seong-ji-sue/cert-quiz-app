# WORKFLOW.md — 개발 워크플로우 전체 프로세스

## 1. 전체 흐름 요약

```
[작업 시작]
    │
    ▼
① feature 브랜치 생성 (develop에서 분기)
    │
    ▼
② 개발 & 상황별 커밋
    │
    ▼
③ AI 코드 리뷰 → docs/review/YYYY-MM-DD-브랜치명.md 기록
    │
    ▼
④ 서버 실행 검증 (curl + 브라우저 URL 출력)
    │
  오류 있음? → 수정 후 ② 로 돌아감
    │ 없음
    ▼
⑤ feature 브랜치 푸시 + Slack 알림 발송
    │
    ▼
⑥ 사용자: Slack 알림 확인 후 머지 결정
    │
    ▼
⑦ develop 머지 & 푸시 (사용자 승인 후)
```

---

## 2. 단계별 상세

### ① feature 브랜치 생성
```bash
git checkout develop
git pull origin develop
git checkout -b feature/작업명
```
- 브랜치명 규칙: `feature/기능명`, `fix/버그명`, `docs/문서명`, `chore/설정명`

---

### ② 개발 & 상황별 커밋

커밋은 논리적 단위로 자주 합니다.

| 상황 | 타입 | 예시 |
|------|------|------|
| 새 기능 추가 | `feat` | `feat(quiz): [2026-03-08] 퀴즈 목록 API 구현` |
| 버그 수정 | `fix` | `fix(auth): [2026-03-08] 토큰 갱신 오류 수정` |
| 문서 변경 | `docs` | `docs: [2026-03-08] ARCH.md 구조 업데이트` |
| 설정 변경 | `chore` | `chore: [2026-03-08] package.json 의존성 추가` |
| 리팩토링 | `refactor` | `refactor(api): [2026-03-08] 중복 로직 통합` |
| WIP (진행 중) | `wip` | `wip: [2026-03-08] 인증 미들웨어 작성 중` |

---

### ③ AI 코드 리뷰

작업 완료 후 Claude가 자동으로 리뷰를 수행합니다.

**리뷰 항목:**
- 변경된 파일 목록 및 diff 검토
- 런타임 오류 가능성 (import 오류, 타입 불일치 등)
- 보안 취약점 (XSS, SQL Injection, 하드코딩된 시크릿 등)
- 코드 스타일 및 컨벤션 준수
- 누락된 의존성 또는 설정

**기록 위치:** `docs/review/YYYY-MM-DD-브랜치명.md`

---

### ④ 서버 실행 검증

```bash
# 개발 서버 시작 (백그라운드)
cd packages/host && NEXT_PRIVATE_LOCAL_WEBPACK=true NODE_ENV=development node server.mjs &
sleep 5

# 헬스체크
curl -s -o /dev/null -w "%{http_code}" http://localhost:4000

# 브라우저 URL 출력 (사용자가 직접 접속)
echo "🌐 브라우저에서 확인: http://localhost:4000"
```

> **Docker 환경**: 컨테이너 포트가 호스트에 노출되어 있으므로 호스트 브라우저에서 직접 접속 가능.

---

### ⑤ 브랜치 푸시 + Slack 알림

```bash
# 브랜치 푸시
git push origin feature/작업명

# Slack 알림 (브랜치 작업 내용 요약 포함)
./notify.sh "feature/작업명 | 작업 내용 요약 | 검증 완료 | PR 리뷰 요청"
```

---

### ⑥ Slack 알림 형식

```
🤖 [Cert-Quiz-App] feature/작업명
📌 작업 내용: ...
✅ AI 리뷰: 이상 없음 (docs/review/날짜-브랜치.md 참조)
🌐 검증 URL: http://localhost:4000
📋 PR: https://github.com/seong-ji-sue/cert-quiz-app/pull/new/feature/작업명
⏳ develop 머지 대기 중 — Slack 확인 후 승인해 주세요
```

---

### ⑦ develop 머지 (사용자 승인 후 Claude가 실행)

사용자가 Slack 알림 확인 후 "머지해줘" 또는 승인 메시지를 남기면:

```bash
git checkout develop
git merge --no-ff feature/작업명 -m "feat: [날짜] feature/작업명 → develop 머지"
git push origin develop
```

---

## 3. 자율 실행 원칙 (승인 최소화)

Claude Code는 아래 작업을 **자동 승인 없이 자율 실행**합니다:
- 파일 읽기/쓰기/편집
- `yarn install` (의존성 설치)
- `git add`, `git commit`, `git push` (feature 브랜치)
- `git checkout -b` (새 브랜치 생성)
- 개발 서버 실행 및 curl 헬스체크
- docs/ 문서 작성

아래 작업은 **반드시 사용자 확인 후 실행**합니다:
- `develop` / `master` 브랜치 직접 커밋
- `git push --force`
- 파일/디렉터리 **삭제**
- 환경변수 파일 수정 (`.env.*`)
- docker-compose 스택 재시작

---

## 4. 문서 파일 설명 (docs/ 구조)

자세한 내용은 [docs/README.md](./README.md) 참조.
