'use strict';

const request = require('supertest');
const { signToken } = require('@urbanflow/shared/middleware/auth');
const { createApp } = require('../../src/app');

jest.mock('@urbanflow/shared/middleware/rateLimiter', () => (_req, _res, next) => next());

jest.mock('@urbanflow/shared/utils/db', () => ({
  healthCheck: jest.fn().mockResolvedValue(true),
  getPool: jest.fn(),
  query: jest.fn(),
}));

jest.mock('@urbanflow/shared/utils/redis', () => ({
  healthCheck: jest.fn().mockResolvedValue(true),
  getRedis: jest.fn(),
}));

jest.mock('../../src/services/gpsService', () => ({
  recordCoordinate: jest.fn(),
  getCachedPosition: jest.fn(),
  setProducer: jest.fn(),
}));

jest.mock('../../src/services/vehicleService', () => ({
  getVehicleWithPosition: jest.fn(),
  getVehicleTrack: jest.fn(),
}));

jest.mock('../../src/services/routeService', () => ({
  updateRoute: jest.fn(),
  setProducer: jest.fn(),
}));

const gpsService = require('../../src/services/gpsService');
const vehicleService = require('../../src/services/vehicleService');
const routeService = require('../../src/services/routeService');
describe('GPS API integration', () => {
  const app = createApp();
  const validToken = signToken({ id: 1, role: 'operator' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('GET /ready', () => {
    it('returns ready when dependencies are healthy', async () => {
      const res = await request(app).get('/ready');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ready');
    });
  });

  describe('POST /api/gps/coordinates', () => {
    it('accepts coordinates with valid API key', async () => {
      gpsService.recordCoordinate.mockResolvedValue({
        coordinate: {
          id: 1,
          vehicle_id: 'BUS-101',
          latitude: '40.71280000',
          longitude: '-74.00600000',
          speed: '20.00',
          heading: '90.00',
          recorded_at: '2026-06-14T12:00:00.000Z',
        },
        vehicle: { route_id: 'R-42' },
      });

      const res = await request(app)
        .post('/api/gps/coordinates')
        .set('X-API-Key', 'urbanflow-gps-dev-key')
        .send({
          vehicleId: 'BUS-101',
          latitude: 40.7128,
          longitude: -74.006,
          speed: 20,
          heading: 90,
        });

      expect(res.status).toBe(201);
      expect(res.body.coordinate.vehicleId).toBe('BUS-101');
    });

    it('accepts coordinates with valid JWT', async () => {
      gpsService.recordCoordinate.mockResolvedValue({
        coordinate: {
          id: 2,
          vehicle_id: 'BUS-102',
          latitude: '40.70000000',
          longitude: '-74.00000000',
          speed: '10.00',
          heading: '45.00',
          recorded_at: '2026-06-14T12:05:00.000Z',
        },
        vehicle: { route_id: 'R-43' },
      });

      const res = await request(app)
        .post('/api/gps/coordinates')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          vehicleId: 'BUS-102',
          latitude: 40.7,
          longitude: -74,
        });

      expect(res.status).toBe(201);
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/gps/coordinates')
        .send({
          vehicleId: 'BUS-101',
          latitude: 40.7128,
          longitude: -74.006,
        });

      expect(res.status).toBe(401);
    });

    it('validates coordinate payload', async () => {
      const res = await request(app)
        .post('/api/gps/coordinates')
        .set('X-API-Key', 'urbanflow-gps-dev-key')
        .send({
          vehicleId: 'BUS-101',
          latitude: 200,
          longitude: -74.006,
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/gps/vehicles/:id', () => {
    it('returns vehicle position', async () => {
      vehicleService.getVehicleWithPosition.mockResolvedValue({
        vehicle: {
          vehicleId: 'BUS-101',
          vehicleType: 'bus',
          routeId: 'R-42',
          status: 'active',
        },
        position: {
          vehicleId: 'BUS-101',
          latitude: 40.7128,
          longitude: -74.006,
          speed: 20,
          heading: 90,
          recordedAt: '2026-06-14T12:00:00.000Z',
        },
      });

      const res = await request(app).get('/api/gps/vehicles/BUS-101');

      expect(res.status).toBe(200);
      expect(res.body.vehicle.vehicleId).toBe('BUS-101');
      expect(res.body.position.latitude).toBe(40.7128);
    });

    it('returns 404 when vehicle is missing', async () => {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      vehicleService.getVehicleWithPosition.mockRejectedValue(error);

      const res = await request(app).get('/api/gps/vehicles/MISSING');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/gps/vehicles/:id/track', () => {
    it('returns vehicle track history', async () => {
      vehicleService.getVehicleTrack.mockResolvedValue({
        vehicleId: 'BUS-101',
        count: 1,
        track: [
          {
            id: 1,
            latitude: 40.7128,
            longitude: -74.006,
            speed: 20,
            heading: 90,
            recordedAt: '2026-06-14T12:00:00.000Z',
          },
        ],
      });

      const res = await request(app).get('/api/gps/vehicles/BUS-101/track?limit=10');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.track).toHaveLength(1);
    });
  });

  describe('PUT /api/gps/routes/:id', () => {
    it('requires JWT authentication', async () => {
      const res = await request(app)
        .put('/api/gps/routes/R-42')
        .send({ name: 'Updated Route' });

      expect(res.status).toBe(401);
    });

    it('updates route with valid JWT', async () => {
      routeService.updateRoute.mockResolvedValue({
        routeId: 'R-42',
        name: 'Updated Route',
        origin: 'Central',
        destination: 'Airport',
        stops: [],
        updatedAt: '2026-06-14T13:00:00.000Z',
      });

      const res = await request(app)
        .put('/api/gps/routes/R-42')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: 'Updated Route' });

      expect(res.status).toBe(200);
      expect(res.body.route.name).toBe('Updated Route');
    });
  });
});
