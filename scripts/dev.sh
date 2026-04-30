#!/usr/bin/env bash
set -o pipefail

STORYBOOK_PORT=6006
MINIVODA_PORT=3000
export FORCE_COLOR=1
GREEN=$'\033[32m'
RED=$'\033[31m'
DIM=$'\033[2m'
RESET=$'\033[0m'

surface_warnings() {
  local prefix=$1
  while IFS= read -r line; do
    case "$line" in
      *[Ee]rror*|*[Ww]arn*|*[Ff]ail*|*⚠*|*✕*|*✘*|*⨯*|*×*)
        printf '\r\033[K%s%s%s %s\n' "$DIM" "$prefix" "$RESET" "$line"
        ;;
    esac
  done
}
STORYBOOK_PID=""
MINIVODA_PID=""
STORYBOOK_LOG=""
MINIVODA_LOG=""
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

check_port() {
  local port=$1 name=$2
  if lsof -i ":$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
    printf '  %s\xe2\x9c\x97%s  port %s is already in use (%s)\n' "$RED" "$RESET" "$port" "$name" >&2
    exit 1
  fi
}

cleanup() {
  [[ -n "$STORYBOOK_PID" ]] && kill "$STORYBOOK_PID" 2>/dev/null
  [[ -n "$MINIVODA_PID" ]] && kill "$MINIVODA_PID" 2>/dev/null
  [[ -n "$STORYBOOK_LOG" ]] && rm -f "$STORYBOOK_LOG"
  [[ -n "$MINIVODA_LOG" ]] && rm -f "$MINIVODA_LOG"
}
trap cleanup EXIT INT TERM

check_port "$STORYBOOK_PORT" "Storybook"
check_port "$MINIVODA_PORT" "Minivoda"

STORYBOOK_LOG=$(mktemp)
MINIVODA_LOG=$(mktemp)

(cd "$REPO_ROOT/packages/components" && npx storybook dev -p "$STORYBOOK_PORT" --no-open) > >(tee "$STORYBOOK_LOG" | surface_warnings "[storybook]") 2>&1 &
STORYBOOK_PID=$!

(cd "$REPO_ROOT/packages/test-app" && npx next dev --turbopack --port "$MINIVODA_PORT") > >(tee "$MINIVODA_LOG" | surface_warnings "[minivoda] ") 2>&1 &
MINIVODA_PID=$!

SPINNER_CHARS=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
spin_idx=0
storybook_ready=0
minivoda_ready=0

while [[ $storybook_ready -eq 0 || $minivoda_ready -eq 0 ]]; do
  if ! kill -0 "$STORYBOOK_PID" 2>/dev/null; then
    printf '\r\033[K\n'
    printf '  %s\xe2\x9c\x97%s  Storybook exited unexpectedly:\n\n' "$RED" "$RESET" >&2
    tail -20 "$STORYBOOK_LOG" >&2
    exit 1
  fi
  if ! kill -0 "$MINIVODA_PID" 2>/dev/null; then
    printf '\r\033[K\n'
    printf '  %s\xe2\x9c\x97%s  Minivoda exited unexpectedly:\n\n' "$RED" "$RESET" >&2
    tail -20 "$MINIVODA_LOG" >&2
    exit 1
  fi

  if [[ $storybook_ready -eq 0 ]] && grep -q "Local:" "$STORYBOOK_LOG" 2>/dev/null; then
    storybook_ready=1
  fi
  if [[ $minivoda_ready -eq 0 ]] && grep -q "Local:" "$MINIVODA_LOG" 2>/dev/null; then
    minivoda_ready=1
  fi

  printf '\r%s  Starting dev servers...' "${SPINNER_CHARS[$spin_idx]}"
  spin_idx=$(( (spin_idx + 1) % ${#SPINNER_CHARS[@]} ))
  sleep 0.1
done

printf '\r\033[K\n'
printf '  %s\xe2\x9c\x93%s  Dev servers ready\n\n' "$GREEN" "$RESET"
printf '     Storybook  \xe2\x86\x92  http://localhost:%s\n' "$STORYBOOK_PORT"
printf '     Minivoda   \xe2\x86\x92  http://localhost:%s\n\n' "$MINIVODA_PORT"

tail -n 0 -f "$STORYBOOK_LOG" | sed 's/^/[storybook] /' &
tail -n 0 -f "$MINIVODA_LOG" | sed 's/^/[minivoda]  /' &

wait "$STORYBOOK_PID" "$MINIVODA_PID"
