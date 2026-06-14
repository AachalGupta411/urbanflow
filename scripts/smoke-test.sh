#!/usr/bin/env bash
# UrbanFlow – Post-deploy smoke tests
set -euo pipefail

PASSENGER_URL="${PASSENGER_URL:-http://localhost:3002}"
TICKETING_URL="${TICKETING_URL:-http://localhost:3001}"
GPS_URL="${GPS_URL:-http://localhost:3003}"
NOTIFICATION_URL="${NOTIFICATION_URL:-http://localhost:3004}"
ANALYTICS_URL="${ANALYTICS_URL:-http://localhost:3005}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:8080}"

check_health() {
  local name="$1" url="$2"
  echo -n "Checking $name... "
  if curl -sf "$url/health" > /dev/null; then
    echo "OK"
  else
    echo "FAILED"
    return 1
  fi
}

echo "=== UrbanFlow Smoke Tests ==="

check_health "Passenger Service" "$PASSENGER_URL"
check_health "Ticketing Service" "$TICKETING_URL"
check_health "GPS Service" "$GPS_URL"
check_health "Notification Service" "$NOTIFICATION_URL"
check_health "Analytics Service" "$ANALYTICS_URL"

echo -n "Checking Frontend... "
if curl -sf "$FRONTEND_URL" > /dev/null; then
  echo "OK"
else
  echo "FAILED"
  exit 1
fi

# Register test user and create ticket
RANDOM_EMAIL="smoke-$(date +%s)@urbanflow.test"
echo -n "Registering test user... "
REGISTER=$(curl -sf -X POST "$PASSENGER_URL/api/passengers/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"SmokeTest123!\",\"full_name\":\"Smoke Test\"}")
TOKEN=$(echo "$REGISTER" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then echo "OK"; else echo "FAILED"; exit 1; fi

echo -n "Creating ticket... "
TICKET=$(curl -sf -X POST "$TICKETING_URL/api/tickets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"routeId":"R-101","vehicleType":"bus","origin":"Central Station","destination":"Airport","fare":5.50,"travelDate":"2026-06-15"}')
if echo "$TICKET" | grep -q "ticket_code"; then echo "OK"; else echo "FAILED"; exit 1; fi

echo "=== All smoke tests passed ==="
