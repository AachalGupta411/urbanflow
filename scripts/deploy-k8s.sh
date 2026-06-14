#!/usr/bin/env bash
# Deploy all Kubernetes manifests
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
K8S="$ROOT/kubernetes"

echo "Deploying UrbanFlow to Kubernetes..."

kubectl apply -f "$K8S/namespace/"
kubectl apply -f "$K8S/configmaps/"

if [ -f "$K8S/secrets/app-secrets.yaml" ]; then
  kubectl apply -f "$K8S/secrets/app-secrets.yaml"
else
  echo "WARNING: app-secrets.yaml not found. Copy from .example first."
fi

if [ -f "$K8S/secrets/mysql-secrets.yaml" ]; then
  kubectl apply -f "$K8S/secrets/mysql-secrets.yaml"
fi

kubectl apply -f "$K8S/rbac/"
kubectl apply -f "$K8S/deployments/"
kubectl apply -f "$K8S/services/"
kubectl apply -f "$K8S/hpa/"
kubectl apply -f "$K8S/ingress/"
kubectl apply -f "$K8S/network-policies/"
kubectl apply -f "$K8S/backup/"

echo "Waiting for rollouts..."
for dep in ticketing-service passenger-service gps-service notification-service analytics-service frontend; do
  kubectl rollout status "deployment/$dep" -n urbanflow --timeout=300s || true
done

echo "Deployment complete."
