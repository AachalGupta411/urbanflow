#!/usr/bin/env bash
# UrbanFlow dev mode – infra in Docker, apps run locally (port 5173)
# Use this if the full Docker build is slow or failing.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

"$ROOT/scripts/check-docker.sh"

PIDS_FILE="$ROOT/.dev-local.pids"
LOG_DIR="$ROOT/.dev-local-logs"
mkdir -p "$LOG_DIR"

cleanup() {
  echo ""
  echo "Stopping local services..."
  if [ -f "$PIDS_FILE" ]; then
    while read -r pid; do
      kill "$pid" 2>/dev/null || true
    done < "$PIDS_FILE"
    rm -f "$PIDS_FILE"
  fi
  echo "Done. Infra containers (mysql/redis/kafka) are still running."
  echo "Stop them with: docker compose stop mysql redis kafka"
}
trap cleanup EXIT INT TERM

export NODE_ENV=development
export MYSQL_HOST=127.0.0.1
export MYSQL_PORT=3307
export MYSQL_USER=urbanflow
export MYSQL_PASSWORD=urbanflow_pass
export REDIS_URL=redis://127.0.0.1:6379
export KAFKA_BROKERS=127.0.0.1:9092
export JWT_SECRET=urbanflow-dev-secret-change-in-prod
export LOG_LEVEL=info
export GPS_API_KEY=urbanflow-gps-dev-key

echo "=== Starting infrastructure (MySQL, Redis, Kafka) ==="
docker compose up -d mysql redis kafka

echo "Waiting for MySQL to be ready..."
for i in $(seq 1 30); do
  if docker compose exec -T mysql mysqladmin ping -h localhost -uurbanflow -purbanflow_pass &>/dev/null; then
    echo "MySQL is ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERROR: MySQL did not become ready in time."
    docker compose logs mysql --tail 20
    exit 1
  fi
  sleep 2
done

echo "Installing dependencies (if needed)..."
(cd services/shared && npm install --silent)
for svc in passenger-service ticketing-service gps-service notification-service analytics-service; do
  (cd "services/$svc" && npm install --silent)
done
(cd frontend && npm install --silent)

: > "$PIDS_FILE"

start_service() {
  local name="$1" port="$2" db="$3"
  echo "Starting $name on port $port..."
  (
    cd "$ROOT/services/$name"
    export SERVICE_NAME="$name"
    export PORT="$port"
    export MYSQL_DATABASE="$db"
    export NODE_PATH="$ROOT/services/$name/node_modules"
    node src/index.js >> "$LOG_DIR/$name.log" 2>&1
  ) &
  echo $! >> "$PIDS_FILE"
}

start_service passenger-service 3002 passenger_db
start_service ticketing-service 3001 ticketing_db
start_service gps-service 3003 gps_db
start_service notification-service 3004 notification_db
start_service analytics-service 3005 analytics_db

echo "Waiting for backend health checks..."
for i in $(seq 1 20); do
  if curl -sf http://127.0.0.1:3002/health &>/dev/null \
     && curl -sf http://127.0.0.1:3001/health &>/dev/null; then
    echo "Backends are up."
    break
  fi
  sleep 2
done

echo ""
echo "=== UrbanFlow dev server ==="
echo "  Frontend:  http://localhost:5173  (Vite dev + API proxy)"
echo "  Logs:      $LOG_DIR/"
echo "  Press Ctrl+C to stop app processes"
echo ""

cd frontend
npm run dev
