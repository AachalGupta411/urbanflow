import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(99)<500'],
    errors: ['rate<0.01'],
  },
};

const PASSENGER_URL = __ENV.PASSENGER_URL || 'http://localhost:3002';
const TICKETING_URL = __ENV.TICKETING_URL || 'http://localhost:3001';

let authToken = '';

export function setup() {
  const email = `load-${Date.now()}@urbanflow.test`;
  const res = http.post(
    `${PASSENGER_URL}/api/passengers/register`,
    JSON.stringify({
      email,
      password: 'LoadTest123!',
      fullName: 'Load Test User',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  const body = JSON.parse(res.body);
  return { token: body.token };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  };

  const createRes = http.post(
    `${TICKETING_URL}/api/tickets`,
    JSON.stringify({
      routeId: 'R-101',
      vehicleType: 'bus',
      origin: 'Central Station',
      destination: 'Airport',
      fare: 5.5,
      travelDate: '2026-06-15',
    }),
    { headers }
  );

  const ok = check(createRes, {
    'ticket created': (r) => r.status === 201,
    'has ticket_code': (r) => JSON.parse(r.body).ticket?.ticket_code !== undefined,
  });
  errorRate.add(!ok);

  sleep(0.5);
}
