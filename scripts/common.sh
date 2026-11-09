#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT"
if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi
export DEMO_CONTEXT=kind-interview-demo
kubectl() {
  command kubectl --context "$DEMO_CONTEXT" "$@"
}
