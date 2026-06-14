import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(99)<300'],
    errors: ['rate<0.01'],
  },
};

const GPS_URL = __ENV.GPS_URL || 'http://localhost:3003';
const API_KEY = __ENV.GPS_API_KEY || 'urbanflow-gps-dev-key';

const VEHICLES = ['BUS-001', 'BUS-002', 'METRO-10', 'EV-001'];

export default function () {
  const vehicleId = VEHICLES[Math.floor(Math.random() * VEHICLES.length)];
  const lat = 40.7128 + (Math.random() - 0.5) * 0.1;
  const lng = -74.006 + (Math.random() - 0.5) * 0.1;

  const res = http.post(
    `${GPS_URL}/api/gps/coordinates`,
    JSON.stringify({
      vehicleId,
      latitude: lat,
      longitude: lng,
      speed: Math.random() * 60,
      heading: Math.random() * 360,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
    }
  );

  const ok = check(res, { 'gps posted': (r) => r.status === 201 || r.status === 200 });
  errorRate.add(!ok);
  sleep(0.1);
}
