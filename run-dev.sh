#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$ROOT/.." && pwd)"
WORKSPACE="$REPO/unn-rocq-kalman.code-workspace"
npm run build --prefix "$ROOT"
exec code --new-window "$WORKSPACE" --extensionDevelopmentPath="$ROOT/packages/extension"
