'use strict';

process.env.SERVICE_NAME = 'notification-service';
process.env.PORT = '3004';
process.env.MYSQL_DATABASE = 'notification_db';
process.env.JWT_SECRET = 'test-jwt-secret';

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

jest.mock('../../src/services/notificationService', () => ({
  listForPassenger: jest.fn(),
  announce: jest.fn(),
}));

const notificationService = require('../../src/services/notificationService');

describe('Notification API integration', () => {
  const app = createApp();
  const passengerToken = signToken({ id: 42, email: 'passenger@example.com', role: 'passenger' });
  const adminToken = signToken({ id: 1, email: 'admin@example.com', role: 'admin' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok status', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('notification-service');
    });
  });

  describe('GET /ready', () => {
    it('returns ready when dependencies are healthy', async () => {
      const res = await request(app).get('/ready');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ready');
      expect(res.body.checks.mysql).toBe(true);
      expect(res.body.checks.redis).toBe(true);
    });
  });

  describe('GET /metrics', () => {
    it('returns Prometheus metrics', async () => {
      const res = await request(app).get('/metrics');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/plain/);
      expect(res.text).toContain('http_requests_total');
    });
  });

  describe('GET /api/notifications', () => {
    it('returns notifications for authenticated passenger', async () => {
      notificationService.listForPassenger.mockResolvedValue([
        {
          id: 1,
          passengerId: 42,
          type: 'system',
          title: 'Ticket Confirmed',
          message: 'Your ticket is confirmed.',
          routeId: 'R-1',
          isRead: false,
          createdAt: '2026-06-14T12:00:00.000Z',
        },
      ]);

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.notifications[0].title).toBe('Ticket Confirmed');
      expect(notificationService.listForPassenger).toHaveBeenCalledWith(42, { limit: 50, offset: 0 });
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app).get('/api/notifications');

      expect(res.status).toBe(401);
    });

    it('validates pagination query params', async () => {
      const res = await request(app)
        .get('/api/notifications?limit=500')
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/notifications/announce', () => {
    it('creates an announcement with admin JWT', async () => {
      notificationService.announce.mockResolvedValue({
        id: 10,
        passengerId: null,
        type: 'system',
        title: 'Maintenance Window',
        message: 'Service pause at midnight.',
        routeId: null,
        isRead: false,
        createdAt: '2026-06-14T18:00:00.000Z',
      });

      const res = await request(app)
        .post('/api/notifications/announce')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Maintenance Window',
          message: 'Service pause at midnight.',
        });

      expect(res.status).toBe(201);
      expect(res.body.notification.title).toBe('Maintenance Window');
    });

    it('allows any authenticated JWT in demo mode', async () => {
      notificationService.announce.mockResolvedValue({
        id: 11,
        passengerId: 42,
        type: 'system',
        title: 'Personal Alert',
        message: 'Your bus is arriving.',
        routeId: 'R-9',
        isRead: false,
        createdAt: '2026-06-14T18:30:00.000Z',
      });

      const res = await request(app)
        .post('/api/notifications/announce')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({
          title: 'Personal Alert',
          message: 'Your bus is arriving.',
          passengerId: 42,
          routeId: 'R-9',
        });

      expect(res.status).toBe(201);
      expect(notificationService.announce).toHaveBeenCalledWith({
        title: 'Personal Alert',
        message: 'Your bus is arriving.',
        passengerId: 42,
        routeId: 'R-9',
      });
    });

    it('rejects unauthenticated announce requests', async () => {
      const res = await request(app)
        .post('/api/notifications/announce')
        .send({
          title: 'Test',
          message: 'No auth',
        });

      expect(res.status).toBe(401);
    });

    it('validates announce payload', async () => {
      const res = await request(app)
        .post('/api/notifications/announce')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '',
          message: 'Missing title',
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });
});
