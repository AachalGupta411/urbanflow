#!/usr/bin/env bash
# One-command local development setup
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== UrbanFlow Local Setup ==="

"$ROOT/scripts/check-docker.sh"

echo "Installing shared library dependencies..."
(cd services/shared && npm install --silent)

for svc in ticketing-service passenger-service gps-service notification-service analytics-service; do
  echo "Installing $svc dependencies..."
  (cd "services/$svc" && npm install --silent)
done

echo "Installing frontend dependencies..."
(cd frontend && npm install --silent)

echo "Starting Docker Compose stack..."
docker compose up -d --build

echo "Waiting for services to be healthy (up to 3 minutes)..."
sleep 30

MAX_RETRIES=12
for i in $(seq 1 $MAX_RETRIES); do
  if ./scripts/smoke-test.sh 2>/dev/null; then
    echo ""
    echo "=== UrbanFlow is ready! ==="
    echo ""
    echo "  >>> Open the app:  http://localhost:8080  <<<"
    echo ""
    echo "  API services: 3001-3005"
    echo ""
    echo "  Monitoring (optional – not started by default):"
    echo "    docker compose --profile observability up -d"
    echo "    Grafana:     http://localhost:3000  (admin/admin)"
    echo "    Prometheus:  http://localhost:9090"
    echo "    Kibana:      http://localhost:5601"
    exit 0
  fi
  echo "  Attempt $i/$MAX_RETRIES – waiting..."
  sleep 15
done

echo "Some services may still be starting. Run: ./scripts/smoke-test.sh"
