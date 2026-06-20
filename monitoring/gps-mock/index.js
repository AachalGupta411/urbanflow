'use strict';

const http = require('http');

const GPS_URL = process.env.GPS_URL || 'http://gps-service:3003';
const GPS_API_KEY = process.env.GPS_API_KEY || 'urbanflow-gps-dev-key';
const TICK_MS = Number(process.env.TICK_MS || 5000);
const PORT = Number(process.env.PORT || 3011);

const fleet = [
  { id: 'BUS-001', lat: 19.0231, lng: 72.8641, speed: 40, heading: 52, dLat: 0.00025, dLng: 0.00018 },
  { id: 'BUS-002', lat: 19.0862, lng: 72.8635, speed: 0, heading: 0, dLat: 0.00012, dLng: -0.00008 },
  { id: 'METRO-10', lat: 19.0345, lng: 72.9225, speed: 65, heading: 98, dLat: 0.00015, dLng: 0.00035 },
  { id: 'EV-001', lat: 19.0584, lng: 72.8190, speed: 38, heading: 285, dLat: -0.0001, dLng: -0.00022 },
];

async function postCoordinate(vehicle) {
  const jitter = () => (Math.random() - 0.5) * 0.0001;
  vehicle.lat += vehicle.dLat + jitter();
  vehicle.lng += vehicle.dLng + jitter();
  vehicle.heading = (vehicle.heading + (Math.random() * 6 - 3) + 360) % 360;
  if (vehicle.speed > 0) {
    vehicle.speed = Math.max(15, Math.min(70, vehicle.speed + (Math.random() * 4 - 2)));
  }

  const res = await fetch(`${GPS_URL}/api/gps/coordinates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': GPS_API_KEY,
    },
    body: JSON.stringify({
      vehicleId: vehicle.id,
      latitude: Number(vehicle.lat.toFixed(6)),
      longitude: Number(vehicle.lng.toFixed(6)),
      speed: Number(vehicle.speed.toFixed(1)),
      heading: Number(vehicle.heading.toFixed(1)),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${vehicle.id}: ${res.status} ${text}`);
  }
}

async function tick() {
  for (const vehicle of fleet) {
    try {
      await postCoordinate(vehicle);
    } catch (err) {
      console.warn('GPS mock tick failed:', err.message);
    }
  }
}

setInterval(() => void tick(), TICK_MS);
void tick();

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'gps-mock', fleet: fleet.length }));
    return;
  }
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`GPS mock simulator listening on :${PORT}, posting every ${TICK_MS}ms`);
});
