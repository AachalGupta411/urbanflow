#!/usr/bin/env bash
# Build all UrbanFlow Docker images
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TAG="${1:-latest}"

SERVICES=(ticketing-service passenger-service gps-service notification-service analytics-service)

echo "Building UrbanFlow images (tag: $TAG)..."

for svc in "${SERVICES[@]}"; do
  echo "→ urbanflow/$svc:$TAG"
  docker build -f "$ROOT/services/$svc/Dockerfile" \
    -t "urbanflow/$svc:$TAG" \
    "$ROOT/services/"
done

echo "→ urbanflow/frontend:$TAG"
docker build -f "$ROOT/frontend/Dockerfile" -t "urbanflow/frontend:$TAG" "$ROOT/frontend/"

echo "All images built successfully."
