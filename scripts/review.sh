#!/bin/bash
# review.sh — AI 코드 리뷰 기록 생성 스크립트
# Claude가 리뷰 후 이 스크립트로 결과를 기록합니다.
# 사용법: ./scripts/review.sh "최종판정" "리뷰 요약"
#   최종판정: pass | warn | fail

DIR="$(dirname "$0")/.."
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
DATE=$(date '+%Y-%m-%d')
TIME=$(date '+%H:%M')
STATUS=${1:-"pass"}     # pass | warn | fail
SUMMARY=${2:-"리뷰 완료"}

REVIEW_DIR="$DIR/docs/review"
REVIEW_FILE="$REVIEW_DIR/${DATE}-${BRANCH//\//-}.md"

mkdir -p "$REVIEW_DIR"

if [ "$STATUS" = "pass" ]; then
  BADGE="✅ 머지 가능"
elif [ "$STATUS" = "warn" ]; then
  BADGE="⚠️ 수정 후 재검토"
else
  BADGE="❌ 머지 불가"
fi

cat >> "$REVIEW_FILE" << EOF

---
## 리뷰 — $TIME
**브랜치**: \`$BRANCH\`
**판정**: $BADGE

$SUMMARY
EOF

echo "📝 리뷰 기록 저장: $REVIEW_FILE"
echo "   판정: $BADGE"
