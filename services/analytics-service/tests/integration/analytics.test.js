'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../../src/index');
const analyticsService = require('../../src/services/analyticsService');
const { healthCheck: dbHealthCheck } = require('../../../shared/utils/db');
const { healthCheck: redisHealthCheck } = require('../../../shared/utils/redis');
const config = require('../../../shared/config');

jest.mock('../../src/services/analyticsService');
jest.mock('../../../shared/utils/db');
jest.mock('../../../shared/utils/redis');

describe('Analytics API integration', () => {
  let app;
  const mockConsumer = { connect: jest.fn(), disconnect: jest.fn() };

  const authToken = jwt.sign(
    { id: 1, email: 'admin@example.com' },
    config.jwt.secret,
    { expiresIn: '1h' }
  );

  beforeEach(() => {
    app = createApp({ enableRateLimit: false });
    app.locals.kafkaConsumer = mockConsumer;
    dbHealthCheck.mockResolvedValue(true);
    redisHealthCheck.mockResolvedValue(true);
  });

  describe('GET /health', () => {
    it('returns service health status', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe(config.serviceName);
    });
  });

  describe('GET /ready', () => {
    it('returns ready when all dependencies are available', async () => {
      const res = await request(app).get('/ready');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ready');
      expect(res.body.checks).toEqual({ mysql: true, redis: true, kafka: true });
    });

    it('returns 503 when kafka consumer is unavailable', async () => {
      app.locals.kafkaConsumer = null;

      const res = await request(app).get('/ready');

      expect(res.status).toBe(503);
      expect(res.body.status).toBe('not_ready');
      expect(res.body.checks.kafka).toBe(false);
    });
  });

  describe('GET /api/analytics/passengers', () => {
    it('returns passenger analytics without authentication', async () => {
      analyticsService.getPassengerAnalytics.mockResolvedValue({
        from: '2026-06-01',
        to: '2026-06-14',
        summary: { total_registered: 10, active_users: 7 },
        daily: [],
        cached: false,
      });

      const res = await request(app).get('/api/analytics/passengers');

      expect(res.status).toBe(200);
      expect(res.body.summary.total_registered).toBe(10);
      expect(analyticsService.getPassengerAnalytics).toHaveBeenCalled();
    });

    it('accepts optional JWT without requiring it', async () => {
      analyticsService.getPassengerAnalytics.mockResolvedValue({
        from: '2026-06-01',
        to: '2026-06-14',
        summary: { total_registered: 10, active_users: 7 },
        daily: [],
        cached: false,
      });

      const res = await request(app)
        .get('/api/analytics/passengers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
    });

    it('validates date query parameters', async () => {
      const res = await request(app).get('/api/analytics/passengers?from=not-a-date');

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/analytics/tickets', () => {
    it('returns ticket analytics with optional vehicle_type filter', async () => {
      analyticsService.getTicketAnalytics.mockResolvedValue({
        from: '2026-06-01',
        to: '2026-06-14',
        vehicle_type: 'bus',
        summary: { tickets_created: 50, tickets_cancelled: 5, total_revenue: 500 },
        daily: [],
        cached: false,
      });

      const res = await request(app).get('/api/analytics/tickets?vehicle_type=bus');

      expect(res.status).toBe(200);
      expect(res.body.summary.tickets_created).toBe(50);
      expect(analyticsService.getTicketAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({ vehicle_type: 'bus' })
      );
    });

    it('rejects invalid vehicle_type', async () => {
      const res = await request(app).get('/api/analytics/tickets?vehicle_type=train');

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/analytics/routes', () => {
    it('returns route utilization analytics', async () => {
      analyticsService.getRouteAnalytics.mockResolvedValue({
        from: '2026-06-01',
        to: '2026-06-14',
        route_id: 'R-101',
        summary: { ticket_count: 20, gps_event_count: 100 },
        daily: [],
        cached: false,
      });

      const res = await request(app).get('/api/analytics/routes?route_id=R-101');

      expect(res.status).toBe(200);
      expect(res.body.summary.ticket_count).toBe(20);
    });
  });

  describe('GET /metrics', () => {
    it('returns Prometheus metrics', async () => {
      const res = await request(app).get('/metrics');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/plain/);
    });
  });
});
