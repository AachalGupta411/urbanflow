import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 30 },
    { duration: '2m', target: 60 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<800'],
  },
};

const BASE = {
  passenger: __ENV.PASSENGER_URL || 'http://localhost:3002',
  ticketing: __ENV.TICKETING_URL || 'http://localhost:3001',
  gps: __ENV.GPS_URL || 'http://localhost:3003',
  analytics: __ENV.ANALYTICS_URL || 'http://localhost:3005',
};

export function setup() {
  const email = `mixed-${Date.now()}@urbanflow.test`;
  const reg = http.post(
    `${BASE.passenger}/api/passengers/register`,
    JSON.stringify({ email, password: 'Mixed123!', fullName: 'Mixed Load User' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  return { token: JSON.parse(reg.body).token };
}

export default function (data) {
  const auth = { Authorization: `Bearer ${data.token}`, 'Content-Type': 'application/json' };

  check(http.get(`${BASE.passenger}/health`), { 'passenger up': (r) => r.status === 200 });
  check(http.get(`${BASE.ticketing}/health`), { 'ticketing up': (r) => r.status === 200 });
  check(http.get(`${BASE.gps}/health`), { 'gps up': (r) => r.status === 200 });

  http.post(
    `${BASE.ticketing}/api/tickets`,
    JSON.stringify({
      routeId: 'R-101', vehicleType: 'bus',
      origin: 'Central', destination: 'Airport', fare: 5.5, travelDate: '2026-06-15',
    }),
    { headers: auth }
  );

  http.post(
    `${BASE.gps}/api/gps/coordinates`,
    JSON.stringify({ vehicleId: 'BUS-001', latitude: 40.71, longitude: -74.0, speed: 30 }),
    { headers: { 'Content-Type': 'application/json', 'X-API-Key': 'urbanflow-gps-dev-key' } }
  );

  http.get(`${BASE.analytics}/api/analytics/tickets`);
  sleep(1);
}
