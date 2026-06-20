#!/usr/bin/env bash
# Seed demo GPS coordinates into MySQL (safe to re-run — appends new points)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MYSQL_CONTAINER="${MYSQL_CONTAINER:-urbanflow-mysql}"
GPS_URL="${GPS_URL:-http://localhost:3003}"
GPS_API_KEY="${GPS_API_KEY:-urbanflow-gps-dev-key}"

echo "=== Seeding GPS coordinates ==="

if docker ps --format '{{.Names}}' | grep -qx "$MYSQL_CONTAINER"; then
  echo "Loading SQL seed into $MYSQL_CONTAINER..."
  docker exec -i "$MYSQL_CONTAINER" mysql -uurbanflow -purbanflow_pass gps_db \
    < "$ROOT/database/init/08-gps-coordinates.sql"
  echo "SQL seed applied."
else
  echo "MySQL container not running — posting coordinates via GPS API..."
  post() {
    local id="$1" lat="$2" lng="$3" speed="$4" heading="$5"
    curl -sf -X POST "$GPS_URL/api/gps/coordinates" \
      -H "Content-Type: application/json" \
      -H "X-API-Key: $GPS_API_KEY" \
      -d "{\"vehicleId\":\"$id\",\"latitude\":$lat,\"longitude\":$lng,\"speed\":$speed,\"heading\":$heading}" \
      > /dev/null
    echo "  Posted $id"
  }
  post BUS-001 19.0231 72.8641 40 52
  post BUS-002 19.0862 72.8635 0 0
  post METRO-10 19.0345 72.9225 65 98
  post EV-001 19.0584 72.8190 38 285
fi

echo "Verifying BUS-001..."
curl -sf "$GPS_URL/api/gps/vehicles/BUS-001" | python3 -c "
import json,sys
d=json.load(sys.stdin)
p=d.get('position')
print('OK — position:', p['latitude'], p['longitude'] if p else 'STILL NULL')
" 2>/dev/null || curl -sf "$GPS_URL/api/gps/vehicles/BUS-001"

echo "=== GPS seed complete ==="
