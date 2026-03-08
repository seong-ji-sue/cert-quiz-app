#!/bin/bash
# db-start.sh — 개발 환경 MariaDB 시작/상태 확인
# 컨테이너 재시작 후 DB가 꺼져 있을 때 사용

set -euo pipefail

DB_USER="root"
DB_PASS="vibe"
DB_NAME="cert_quiz_db"

check_running() {
  mysqladmin ping -u "$DB_USER" -p"$DB_PASS" --silent 2>/dev/null
}

if check_running; then
  echo "✅ MariaDB 이미 실행 중"
  mysql -u "$DB_USER" -p"$DB_PASS" -e "SELECT VERSION() AS version, '${DB_NAME}' AS database_name;" 2>/dev/null
  exit 0
fi

echo "🚀 MariaDB 시작 중..."
mysqld_safe --datadir=/var/lib/mysql &>/tmp/mariadb.log &

MAX=15; COUNT=0
while [ $COUNT -lt $MAX ]; do
  if check_running; then
    echo "✅ MariaDB 시작 완료 (port 3306)"
    echo "   DB: $DB_NAME | User: $DB_USER"
    break
  fi
  sleep 1; COUNT=$((COUNT+1))
done

if ! check_running; then
  echo "❌ MariaDB 시작 실패"
  tail -20 /tmp/mariadb.log
  exit 1
fi

# DB 없으면 생성
mysql -u "$DB_USER" -p"$DB_PASS" -e \
  "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
echo "✅ DB '$DB_NAME' 준비 완료"
