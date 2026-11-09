#!/usr/bin/env bash
source "$(dirname "$0")/common.sh"
: "${AWS_REGION:?Set AWS_REGION in .env}"
: "${AWS_ACCOUNT_ID:?Set AWS_ACCOUNT_ID in .env}"
REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT
chmod 700 "$TEMP_DIR"
export REGISTRY
aws ecr get-login-password --region "$AWS_REGION" |
  node --input-type=module -e '
    import { readFileSync, writeFileSync } from "node:fs";
    const password = readFileSync(0, "utf8").trim();
    if (!password) throw new Error("AWS returned an empty ECR token");
    const auth = Buffer.from(`AWS:${password}`).toString("base64");
    writeFileSync(process.argv[1], JSON.stringify({ auths: { [process.env.REGISTRY]: { auth } } }), { mode: 0o600 });
  ' "$TEMP_DIR/config.json"
for namespace in argocd demo; do
  kubectl create secret generic ecr-pull -n "$namespace" \
    --type=kubernetes.io/dockerconfigjson \
    --from-file=.dockerconfigjson="$TEMP_DIR/config.json" \
    --dry-run=client -o yaml | kubectl apply --server-side --force-conflicts -f -
done
printf 'ECR tokens refreshed in argocd and demo. Refresh again within 12 hours, or sooner if your AWS session expires.\n'
