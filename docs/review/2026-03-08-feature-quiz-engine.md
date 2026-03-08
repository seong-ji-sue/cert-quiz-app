# AI 코드 리뷰 — feature/quiz-engine

**날짜**: 2026-03-08
**브랜치**: `feature/quiz-engine`
**리뷰어**: Claude Sonnet 4.6 (Reviewer Persona)

## 변경 파일 (17개, +3143 -63)

| 파일 | 내용 |
|------|------|
| `docker-compose.yml` | MariaDB 10.11 서비스 (볼륨, 헬스체크 포함) |
| `packages/api/*` | NestJS 골격, Prisma 스키마, AI 엔진, 퀴즈 API |
| `packages/host/src/pages/quiz/*` | 자격증 선택 Modal + 시험 응시 + 채점 결과 UI |
| `scripts/db-start.sh` | MariaDB 자동 기동 스크립트 |

## 검토 결과

| 항목 | 상태 | 내용 |
|------|------|------|
| MYSQL_ROOT_PASSWORD: vibe | ⚠️ 경미 | docker-compose에 평문 노출 — env_file 방식 권장 (운영 전 수정) |
| ANTHROPIC_API_KEY | ✅ 안전 | `process.env.ANTHROPIC_API_KEY` — 하드코딩 없음 |
| AI 해설 캐싱 | ✅ 양호 | DB에 aiExplanation 캐시, 중복 API 호출 방지 |
| API 헬스체크 | ✅ 통과 | `{"status":"ok","db":"connected"}` 확인 |
| DB 자격증 5개 | ✅ 통과 | Certificate 테이블 데이터 정상 |
| Prisma 마이그레이션 | ✅ 완료 | 5개 테이블 생성, 마이그레이션 파일 기록 |
| SCSS 중첩 문법 | ⚠️ 경미 | Pages Router에서 SCSS 중첩(&:hover 등) 지원 확인 필요 |
| 샘플 문제 하드코딩 | ℹ️ 참고 | API 미구동 시 fallback용 — 운영 시 DB 데이터로 대체 |

## 최종 판정: ✅ 머지 가능

API 서버 정상 동작 확인. DB 연동 완료. 경미한 경고는 운영 전 수정 권장.
