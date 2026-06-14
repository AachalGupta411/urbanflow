# Testing Guide – UrbanFlow

## Test Types

| Type | Tool | Location |
|------|------|----------|
| Unit | Jest | `services/*/tests/unit/` |
| Integration | Jest + Supertest | `services/*/tests/integration/` |
| Load | k6 | `tests/load/k6/` |

---

## Unit Tests

Each microservice has Jest unit tests with mocked dependencies.

```bash
# Run all service tests
for svc in ticketing-service passenger-service gps-service notification-service analytics-service; do
  echo "=== $svc ==="
  (cd services/$svc && npm test)
done
```

### Example: Ticketing Service

```bash
cd services/ticketing-service
npm test                    # All tests
npm test -- --coverage      # With coverage report
```

Tests mock MySQL, Redis, and Kafka to isolate business logic.

---

## Integration Tests

Integration tests use Supertest against the Express app with mocked or test database connections.

```bash
cd services/passenger-service
npm test -- tests/integration/
```

### What Integration Tests Cover

- HTTP status codes and response shapes
- Authentication middleware behavior
- Validation error responses
- End-to-end request → controller → service flow (mocked DB)

---

## Load Testing (k6)

### Prerequisites

```bash
brew install k6   # macOS
# or: https://k6.io/docs/get-started/installation/
```

### Run Load Tests

Ensure the stack is running (`docker compose up -d`):

```bash
# Ticket creation load (50 VUs peak)
k6 run tests/load/k6/ticket-load.js

# GPS ingestion load (100 VUs peak)
k6 run tests/load/k6/gps-load.js

# Mixed workload (60 VUs peak)
k6 run tests/load/k6/mixed-workload.js
```

### Custom Targets

```bash
PASSENGER_URL=http://passenger:3002 \
TICKETING_URL=http://ticketing:3001 \
k6 run tests/load/k6/ticket-load.js
```

### Thresholds

| Script | p99 Latency | Error Rate |
|--------|-------------|------------|
| ticket-load.js | < 500ms | < 1% |
| gps-load.js | < 300ms | < 1% |
| mixed-workload.js | p95 < 800ms | < 5% |

### Interpreting Results

```
✓ ticket created
✓ has ticket_code
http_req_duration..............: avg=45ms  p(99)=120ms
errors.........................: 0.00%
```

---

## Smoke Tests

Post-deployment verification:

```bash
./scripts/smoke-test.sh
```

Checks all `/health` endpoints, registers a user, and creates a ticket.

---

## CI Integration

Jenkins pipeline stage 3 runs all unit tests in parallel. Load tests are manual or scheduled (recommended: weekly on staging).

---

## Writing New Tests

### Unit Test Pattern

```javascript
jest.mock('../../../shared/utils/db');
const ticketService = require('../../src/services/ticketService');

describe('createTicket', () => {
  it('creates ticket with valid data', async () => {
    // arrange mocks, act, assert
  });
});
```

### Integration Test Pattern

```javascript
const request = require('supertest');
const { app } = require('../../src/index');

describe('POST /api/tickets', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/tickets').send({});
    expect(res.status).toBe(401);
  });
});
```
