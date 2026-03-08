#!/bin/bash
# ship.sh — 브랜치 작업 완료 후 검증 + Slack 알림까지 한 번에 처리
#
# 워크플로우:
#   1. 현재 브랜치에서 git push
#   2. 서버 실행 검증 (선택)
#   3. Slack 알림 발송 (작업 요약 + PR URL)
#
# 사용법:
#   ./scripts/ship.sh "작업 요약 메시지" [--no-verify]
#   --no-verify: 서버 실행 검증 생략

DIR="$(dirname "$0")/.."
SUMMARY=${1:-"작업 완료"}
NO_VERIFY=false

for arg in "$@"; do
  [ "$arg" = "--no-verify" ] && NO_VERIFY=true
done

BRANCH=$(git -C "$DIR" rev-parse --abbrev-ref HEAD 2>/dev/null)

# master/develop 브랜치에서 직접 실행 방지
if [ "$BRANCH" = "master" ] || [ "$BRANCH" = "develop" ]; then
  echo "⚠️  $BRANCH 브랜치에서는 ship.sh를 직접 실행할 수 없습니다."
  echo "   feature/* 브랜치에서 실행하세요."
  exit 1
fi

echo "================================================"
echo "  🚢 SHIP: $BRANCH"
echo "================================================"

# Step 1: git push
echo ""
echo "📤 [1/3] 브랜치 푸시..."
git -C "$DIR" push origin "$BRANCH" 2>&1
if [ $? -ne 0 ]; then
  echo "❌ git push 실패"
  exit 1
fi
echo "✅ 푸시 완료"

# Step 2: 서버 검증
VERIFY_URL=""
if [ "$NO_VERIFY" = false ]; then
  echo ""
  echo "🔍 [2/3] 서버 실행 검증..."
  bash "$DIR/scripts/verify.sh" all
  if [ $? -eq 0 ]; then
    HOST_PORT=$(grep NEXT_PUBLIC_HOST_PORT "$DIR/.env.development" 2>/dev/null | cut -d= -f2 || echo "4000")
    VERIFY_URL="http://localhost:${HOST_PORT}"
    echo "✅ 검증 성공"
  else
    echo "❌ 서버 검증 실패 — 수정 후 다시 시도하거나 --no-verify 옵션 사용"
    exit 1
  fi
else
  echo ""
  echo "⏭️  [2/3] 서버 검증 생략 (--no-verify)"
fi

# Step 3: Slack 알림
echo ""
echo "📣 [3/3] Slack 알림 전송..."
bash "$DIR/notify.sh" "$SUMMARY" "$VERIFY_URL"

echo ""
echo "================================================"
echo "  ✅ SHIP 완료: $BRANCH"
echo "  Slack 알림을 확인하고 머지 여부를 결정하세요."
echo "================================================"
