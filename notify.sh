#!/bin/bash
DIR="$(dirname "$0")"
if [ -f "$DIR/.env" ]; then
  source "$DIR/.env"
elif [ -f "$DIR/.env.development" ]; then
  source "$DIR/.env.development"
fi

SUMMARY=${1:-"작업 완료"}
curl -X POST -H 'Content-type: application/json' --data "{\"text\":\"🤖 [Cert-Quiz-App]: $SUMMARY\"}" "$SLACK_WEBHOOK_URL"
