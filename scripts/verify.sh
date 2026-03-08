#!/bin/bash
# verify.sh — 개발 서버 실행 및 헬스체크 스크립트
# develop 머지 전 실행하여 서버가 정상 동작하는지 확인합니다.
# 사용법: ./scripts/verify.sh [host|remote|all]

DIR="$(dirname "$0")/.."
TARGET=${1:-"all"}

source_env() {
  if [ -f "$DIR/.env.local" ]; then
    source "$DIR/.env.local"
  elif [ -f "$DIR/.env.development" ]; then
    source "$DIR/.env.development"
  fi
}

source_env

HOST_PORT=${NEXT_PUBLIC_HOST_PORT:-4000}
REMOTE_PORT=${NEXT_PUBLIC_REMOTE_PORT:-4001}

kill_servers() {
  echo "🔄 기존 서버 프로세스 정리..."
  pkill -f "node server.mjs" 2>/dev/null || true
  pkill -f "packages/host" 2>/dev/null || true
  pkill -f "packages/remote" 2>/dev/null || true
  sleep 1
}

start_host() {
  echo "🚀 Host 서버 시작 (port $HOST_PORT)..."
  cd "$DIR/packages/host"
  NEXT_PRIVATE_LOCAL_WEBPACK=true NODE_ENV=development node server.mjs > /tmp/host.log 2>&1 &
  HOST_PID=$!
  echo "   PID: $HOST_PID"
}

start_remote() {
  echo "🚀 Remote 서버 시작 (port $REMOTE_PORT)..."
  cd "$DIR/packages/remote"
  NEXT_PRIVATE_LOCAL_WEBPACK=true NODE_ENV=development node server.mjs > /tmp/remote.log 2>&1 &
  REMOTE_PID=$!
  echo "   PID: $REMOTE_PID"
}

check_health() {
  local PORT=$1
  local NAME=$2
  local MAX=15
  local COUNT=0

  echo "⏳ $NAME (port $PORT) 헬스체크 대기..."
  while [ $COUNT -lt $MAX ]; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT" 2>/dev/null)
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "307" ] || [ "$STATUS" = "302" ]; then
      echo "✅ $NAME 정상 응답 (HTTP $STATUS)"
      return 0
    fi
    sleep 2
    COUNT=$((COUNT+1))
  done

  echo "❌ $NAME 응답 없음 (timeout)"
  echo "--- 로그 ---"
  cat "/tmp/${NAME,,}.log" 2>/dev/null | tail -20
  return 1
}

RESULT=0

kill_servers

if [ "$TARGET" = "host" ] || [ "$TARGET" = "all" ]; then
  start_host
fi
if [ "$TARGET" = "remote" ] || [ "$TARGET" = "all" ]; then
  start_remote
fi

sleep 3

if [ "$TARGET" = "host" ] || [ "$TARGET" = "all" ]; then
  check_health "$HOST_PORT" "Host" || RESULT=1
fi
if [ "$TARGET" = "remote" ] || [ "$TARGET" = "all" ]; then
  check_health "$REMOTE_PORT" "Remote" || RESULT=1
fi

echo ""
if [ $RESULT -eq 0 ]; then
  echo "🎉 검증 성공!"
  echo "   🌐 Host:   http://localhost:$HOST_PORT"
  echo "   🌐 Remote: http://localhost:$REMOTE_PORT"
  echo ""
  echo "   브라우저에서 위 URL을 열어 확인하세요."
else
  echo "💥 검증 실패 — 서버 로그를 확인하세요."
  echo "   cat /tmp/host.log"
  echo "   cat /tmp/remote.log"
fi

exit $RESULT
