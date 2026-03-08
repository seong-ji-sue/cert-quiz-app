#!/bin/bash
if [ -f "$(dirname "$0")/.env" ]; then
  source "$(dirname "$0")/.env"
fi

SUMMARY=${1:-"작업 완료"}
curl -X POST -H 'Content-type: application/json' --data "{\"text\":\"🤖 [Cert-Quiz-App]: $SUMMARY\"}" "$SLACK_WEBHOOK_URL"
