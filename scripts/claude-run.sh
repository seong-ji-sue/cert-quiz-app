#!/usr/bin/env bash
# claude-run.sh — Executable Markdown 실행기
# 마크다운 파일 내 ```bash ... ``` 블록을 추출하여 실행합니다.
#
# 사용법:
#   chmod +x scripts/claude-run.sh
#   ./scripts/claude-run.sh docs/WORKFLOW.md          # 전체 실행
#   ./scripts/claude-run.sh docs/WORKFLOW.md --list   # 블록 목록만 출력
#   ./scripts/claude-run.sh docs/WORKFLOW.md --dry    # 출력만, 실행 안 함

set -euo pipefail

MD_FILE="${1:-}"
MODE="${2:---run}"
DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ -z "$MD_FILE" ] || [ ! -f "$MD_FILE" ]; then
  echo "사용법: $0 <markdown-file> [--run|--list|--dry]"
  echo ""
  echo "실행 가능한 문서 목록:"
  grep -rl '#!/usr/bin/env claude-run' "$DIR/docs/" 2>/dev/null | while read f; do
    echo "  $(basename "$f")"
  done
  exit 1
fi

# shebang 확인
if ! head -1 "$MD_FILE" | grep -q 'claude-run'; then
  echo "⚠️  이 파일은 Executable Markdown이 아닙니다 (shebang 없음)"
  echo "   헤더에 '#!/usr/bin/env claude-run' 추가 후 재시도하세요"
fi

echo "📄 Executable Markdown: $MD_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# bash 코드 블록 추출 (<!-- run --> 태그가 있는 블록만 실행)
python3 - "$MD_FILE" "$MODE" "$DIR" << 'PYEOF'
import sys, re, subprocess, os

md_file = sys.argv[1]
mode = sys.argv[2]
base_dir = sys.argv[3]

with open(md_file) as f:
    content = f.read()

# ```bash ... ``` 블록 추출 (<!-- run --> 주석이 앞에 있는 블록)
pattern = r'<!--\s*run(?:\s+([^-]*?))?\s*-->\s*```bash\s*\n(.*?)```'
blocks = re.findall(pattern, content, re.DOTALL)

if not blocks:
    # run 태그 없으면 모든 bash 블록 추출
    blocks = [('', b) for b in re.findall(r'```bash\s*\n(.*?)```', content, re.DOTALL)]

if mode == '--list':
    print(f"총 {len(blocks)}개 실행 블록")
    for i, (label, code) in enumerate(blocks, 1):
        first_line = code.strip().split('\n')[0][:60]
        print(f"  [{i}] {label or first_line}")
    sys.exit(0)

print(f"▶ {len(blocks)}개 코드 블록 {'(dry-run)' if mode == '--dry' else '실행'}")
print()

errors = []
for i, (label, code) in enumerate(blocks, 1):
    code = code.strip()
    if not code:
        continue
    header = label.strip() or f"블록 {i}"
    print(f"[{i}/{len(blocks)}] {header}")
    print(f"  $ {code.split(chr(10))[0][:70]}")

    if mode == '--dry':
        print(f"  (dry-run 생략)")
        continue

    try:
        result = subprocess.run(
            ['bash', '-c', code],
            capture_output=True, text=True,
            cwd=base_dir, timeout=120
        )
        if result.returncode == 0:
            out = result.stdout.strip()
            if out:
                for line in out.split('\n')[:5]:
                    print(f"  {line}")
            print(f"  ✅ 성공")
        else:
            print(f"  ❌ 실패 (exit {result.returncode})")
            print(f"  {result.stderr.strip()[:200]}")
            errors.append(header)
    except subprocess.TimeoutExpired:
        print(f"  ⏰ 타임아웃")
        errors.append(header)
    print()

if errors:
    print(f"💥 실패한 블록: {', '.join(errors)}")
    sys.exit(1)
else:
    print("🎉 모든 블록 실행 완료")
PYEOF
