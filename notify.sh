#!/bin/bash
# notify.sh — Slack 알림 전송 스크립트
# 사용법:
#   ./notify.sh "작업 요약 메시지"
#   ./notify.sh "작업 요약" "검증 URL"  (선택)

DIR="$(dirname "$0")"
if [ -f "$DIR/.env.local" ]; then
  source "$DIR/.env.local"
elif [ -f "$DIR/.env" ]; then
  source "$DIR/.env"
elif [ -f "$DIR/.env.development" ]; then
  source "$DIR/.env.development"
fi

if [ -z "$SLACK_WEBHOOK_URL" ]; then
  echo "⚠️  SLACK_WEBHOOK_URL 이 설정되지 않았습니다. .env.local 파일을 확인하세요."
  exit 1
fi

SUMMARY=${1:-"작업 완료"}
VERIFY_URL=${2:-""}
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
REPO_URL="https://github.com/seong-ji-sue/cert-quiz-app"
PR_URL="$REPO_URL/pull/new/$BRANCH"
DATE=$(date '+%Y-%m-%d %H:%M')

# Slack 메시지 구성
if [ -n "$VERIFY_URL" ]; then
  VERIFY_LINE="\\n🌐 검증 URL: $VERIFY_URL"
else
  VERIFY_LINE=""
fi

# feature/fix 브랜치인 경우 PR 링크 포함
if echo "$BRANCH" | grep -qE "^(feature|fix|docs|chore|refactor)/"; then
  PR_LINE="\\n📋 PR: $PR_URL\\n⏳ develop 머지 대기 중 — Slack 확인 후 승인해 주세요"
else
  PR_LINE=""
fi

MESSAGE="🤖 *[Cert-Quiz-App]* \`$BRANCH\`\n📅 $DATE\n📌 $SUMMARY$VERIFY_LINE$PR_LINE"

# printf를 통해 JSON 안전하게 구성 (특수문자 포함 시 오류 방지)
JSON_PAYLOAD=$(printf '{"text": "%s"}' "$MESSAGE")

curl -s -X POST -H 'Content-type: application/json' \
  --data "$JSON_PAYLOAD" \
  "$SLACK_WEBHOOK_URL"

echo ""
echo "✅ Slack 알림 전송 완료"
echo "   브랜치: $BRANCH"
echo "   내용: $SUMMARY"
