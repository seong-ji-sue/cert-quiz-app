#!/bin/sh

export PORT=${NEXT_PUBLIC_HOST_PORT:-$PORT}

SERVER_JS_SEARCH="$(cd "$(dirname "$0")" && pwd)/server.js"
SERVER_JS_EXT="server.js"

chmod u+w "$SERVER_JS_SEARCH" 2>/dev/null

echo "[INFO] NEXT_PUBLIC_TABLE_URL = $NEXT_PUBLIC_REMOTE_URL"
echo "[INFO] SERVER_JS_SEARCH = $SERVER_JS_SEARCH"

grep -rl "%%NEXT_PUBLIC_REMOTE_URL%%" /app | xargs sed -i "s#%%NEXT_PUBLIC_REMOTE_URL%%#$NEXT_PUBLIC_REMOTE_URL#g"

exec node "$SERVER_JS_EXT"
