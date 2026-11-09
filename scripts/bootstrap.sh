#!/usr/bin/env bash
source "$(dirname "$0")/common.sh"
docker info >/dev/null
if ! kind get clusters | command grep -qx interview-demo; then
  kind create cluster --config infra/kind/cluster.yaml --image kindest/node:v1.32.2 --wait 120s
fi
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace demo --dry-run=client -o yaml | kubectl apply -f -
kubectl apply --server-side --force-conflicts -k infra/argocd
kubectl wait --for=condition=Established --timeout=120s crd/applications.argoproj.io
kubectl rollout status deployment/argocd-server -n argocd --timeout=300s
kubectl rollout status deployment/argocd-repo-server -n argocd --timeout=300s
kubectl rollout status statefulset/argocd-application-controller -n argocd --timeout=300s
kubectl apply --server-side --force-conflicts -k infra/image-updater
kubectl wait --for=condition=Established --timeout=120s crd/imageupdaters.argocd-image-updater.argoproj.io
kubectl rollout status deployment/argocd-image-updater-controller -n argocd --timeout=300s
printf '\nInfrastructure ready. Configure Git credentials and refresh ECR tokens before applying gitops/argocd.\n'
