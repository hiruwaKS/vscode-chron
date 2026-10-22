#!/bin/sh
set -eu

expected_hash=68c47c1c40e267b27c730940679076823c3187dee7a99eacfee33136e5475e3e

root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$root"

actual_hash=$(
  {
    find checker -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum
    sha256sum autocheck.sh
  } | sha256sum | cut -d' ' -f1
)

case "${1:-}" in
  --print)
    printf '%s\n' "$actual_hash"
    exit 0
    ;;
  --update)
    sed -i "s/^expected_hash=.*/expected_hash=$actual_hash/" "$0"
    printf 'updated: %s\n' "$actual_hash"
    exit 0
    ;;
  "")
    ;;
  *)
    printf 'usage: %s [--print|--update]\n' "$0" >&2
    exit 2
    ;;
esac

if [ "$actual_hash" != "$expected_hash" ]; then
  printf 'checker changed\nexpected: %s\nactual:   %s\n' "$expected_hash" "$actual_hash" >&2
  exit 1
fi

printf 'checker: unchanged\n'
