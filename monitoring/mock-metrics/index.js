'use strict';

const http = require('http');
const client = require('prom-client');

const PORT = Number(process.env.PORT || 3010);
const TICK_MS = Number(process.env.TICK_MS || 2000);

const register = new client.Registry();

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service'],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

const memoryGauge = new client.Gauge({
  name: 'process_resident_memory_bytes',
  help: 'Mock resident memory usage per service',
  labelNames: ['service'],
  registers: [register],
});

const TRAFFIC = [
  { service: 'ticketing-service', method: 'POST', route: '/api/tickets', status_code: '201', weight: 3 },
  { service: 'ticketing-service', method: 'GET', route: '/api/tickets', status_code: '200', weight: 8 },
  { service: 'ticketing-service', method: 'GET', route: '/health', status_code: '200', weight: 2 },
  { service: 'passenger-service', method: 'POST', route: '/api/auth/login', status_code: '200', weight: 5 },
  { service: 'passenger-service', method: 'POST', route: '/api/auth/register', status_code: '201', weight: 2 },
  { service: 'passenger-service', method: 'GET', route: '/api/passengers/me', status_code: '200', weight: 6 },
  { service: 'gps-service', method: 'POST', route: '/api/gps/events', status_code: '201', weight: 12 },
  { service: 'gps-service', method: 'GET', route: '/api/gps/vehicles', status_code: '200', weight: 4 },
  { service: 'notification-service', method: 'POST', route: '/api/notifications', status_code: '201', weight: 4 },
  { service: 'notification-service', method: 'GET', route: '/api/notifications', status_code: '200', weight: 3 },
  { service: 'analytics-service', method: 'GET', route: '/api/analytics/dashboard', status_code: '200', weight: 5 },
  { service: 'analytics-service', method: 'GET', route: '/api/analytics/routes', status_code: '200', weight: 3 },
  { service: 'ticketing-service', method: 'POST', route: '/api/tickets', status_code: '500', weight: 0.3 },
  { service: 'gps-service', method: 'POST', route: '/api/gps/events', status_code: '503', weight: 0.2 },
];

const MEMORY_MB = {
  'ticketing-service': 85,
  'passenger-service': 72,
  'gps-service': 96,
  'notification-service': 64,
  'analytics-service': 110,
};

function pickTraffic() {
  const total = TRAFFIC.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of TRAFFIC) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return TRAFFIC[0];
}

function randomDuration(statusCode) {
  if (statusCode.startsWith('5')) return 0.4 + Math.random() * 1.2;
  return 0.02 + Math.random() * 0.25;
}

function emitTick() {
  const bursts = 1 + Math.floor(Math.random() * 4);
  for (let i = 0; i < bursts; i += 1) {
    const event = pickTraffic();
    const labels = {
      method: event.method,
      route: event.route,
      status_code: event.status_code,
      service: event.service,
    };
    httpRequestTotal.inc(labels);
    httpRequestDuration.observe(labels, randomDuration(event.status_code));
  }

  for (const [service, baseMb] of Object.entries(MEMORY_MB)) {
    const jitter = (Math.random() - 0.5) * 8;
    memoryGauge.set({ service }, (baseMb + jitter) * 1024 * 1024);
  }
}

setInterval(emitTick, TICK_MS);
emitTick();

const server = http.createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'metrics-mock' }));
    return;
  }

  if (req.url === '/metrics') {
    res.writeHead(200, { 'Content-Type': register.contentType });
    res.end(await register.metrics());
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Mock metrics exporter listening on :${PORT}`);
});
