#!/bin/bash
# sync-data.sh — comcbt.com 데이터 동기화 파이프라인
# 사용법: bash scripts/sync-data.sh [category]
#   category: iz | c1 | c2 | jf | w1 | all (기본값: all)
#
# 실행 전 필요: packages/crawler 설치 완료 (Phase 1 이후)

set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)"
CATEGORY="${1:-all}"
DATE=$(date '+%Y-%m-%d')
LOG_FILE="$DIR/data/changelog/${DATE}.json"

source_env() {
  [ -f "$DIR/.env.local" ] && source "$DIR/.env.local" || true
  [ -f "$DIR/.env.development" ] && source "$DIR/.env.development" || true
}

source_env

echo "════════════════════════════════════════"
echo "  📥 ComCBT 데이터 동기화 시작"
echo "  카테고리: $CATEGORY | 날짜: $DATE"
echo "════════════════════════════════════════"

# registry.json 읽기
REGISTRY="$DIR/data/registry.json"
if [ ! -f "$REGISTRY" ]; then
  echo "❌ registry.json 없음. 초기화 필요:"
  echo "   echo '{}' > data/registry.json"
  exit 1
fi

# crawler 설치 확인
CRAWLER_BIN="$DIR/packages/crawler/dist/sync.js"
if [ ! -f "$CRAWLER_BIN" ]; then
  echo "⚠️  packages/crawler 미빌드. 크롤링 스킵."
  echo "   Phase 1 완료 후 실행 가능합니다."
  echo ""
  echo "📋 현재 registry 상태:"
  cat "$REGISTRY" | python3 -c "
import sys, json
r = json.load(sys.stdin)
for cat, info in r.get('categories', {}).items():
  print(f'  {cat}: {info[\"name\"]} — {len(info.get(\"exams\", []))}개 시험')
"
  # 빈 changelog 생성
  echo '{"date":"'"$DATE"'","added":[],"updated":[],"status":"crawler_not_ready"}' > "$LOG_FILE"
  exit 0
fi

# 크롤러 실행
echo "🕷️  크롤러 실행..."
if [ "$CATEGORY" = "all" ]; then
  node "$CRAWLER_BIN" --all
else
  node "$CRAWLER_BIN" --category "$CATEGORY"
fi

# registry 업데이트
python3 - "$REGISTRY" "$DATE" << 'PYEOF'
import sys, json
from datetime import datetime

registry_path = sys.argv[1]
today = sys.argv[2]

with open(registry_path) as f:
    registry = json.load(f)

registry['lastSync'] = datetime.utcnow().isoformat() + 'Z'

with open(registry_path, 'w') as f:
    json.dump(registry, f, ensure_ascii=False, indent=2)

print(f"✅ registry.json 업데이트 완료")
PYEOF

# git 커밋 (data 브랜치)
echo ""
echo "📦 변경사항 커밋..."
git -C "$DIR" add data/
git -C "$DIR" diff --staged --name-only | head -20
git -C "$DIR" commit -m "data: [$DATE] comcbt 데이터 동기화 — $CATEGORY" \
  --author="sync-bot <sync@cert-quiz-app>" 2>/dev/null || echo "변경사항 없음"

echo ""
echo "✅ 동기화 완료"
