'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../../src/index');
const ticketService = require('../../src/services/ticketService');
const { healthCheck: dbHealthCheck } = require('../../../shared/utils/db');
const { healthCheck: redisHealthCheck } = require('../../../shared/utils/redis');
const config = require('../../../shared/config');

jest.mock('../../src/services/ticketService');
jest.mock('../../../shared/utils/db');
jest.mock('../../../shared/utils/redis');

describe('Tickets API integration', () => {
  let app;
  const mockProducer = { connect: jest.fn(), disconnect: jest.fn() };

  const authToken = jwt.sign(
    { id: 42, email: 'commuter@example.com' },
    config.jwt.secret,
    { expiresIn: '1h' }
  );

  const sampleTicket = {
    id: 1,
    passenger_id: 42,
    route_id: 'R-101',
    vehicle_type: 'bus',
    origin: 'Central Station',
    destination: 'Airport Terminal',
    fare: 12.5,
    status: 'active',
    ticket_code: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    travel_date: '2026-06-15',
    created_at: '2026-06-14T10:00:00.000Z',
    updated_at: '2026-06-14T10:00:00.000Z',
  };

  beforeEach(() => {
    app = createApp({ enableRateLimit: false });
    app.locals.kafkaProducer = mockProducer;
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

    it('returns 503 when a dependency is unavailable', async () => {
      dbHealthCheck.mockResolvedValue(false);

      const res = await request(app).get('/ready');

      expect(res.status).toBe(503);
      expect(res.body.status).toBe('not_ready');
    });
  });

  describe('POST /api/tickets', () => {
    it('creates a ticket with valid JWT and payload', async () => {
      ticketService.createTicket.mockResolvedValue(sampleTicket);

      const res = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          route_id: 'R-101',
          vehicle_type: 'bus',
          origin: 'Central Station',
          destination: 'Airport Terminal',
          fare: 12.5,
          travel_date: '2026-06-15',
        });

      expect(res.status).toBe(201);
      expect(res.body.ticket).toEqual(sampleTicket);
      expect(ticketService.createTicket).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ route_id: 'R-101' }),
        mockProducer
      );
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .send({ route_id: 'R-101', origin: 'A', destination: 'B', fare: 5, travel_date: '2026-06-15' });

      expect(res.status).toBe(401);
    });

    it('returns 400 for invalid payload', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ route_id: '', fare: -1 });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/tickets/validate', () => {
    it('validates a ticket without authentication', async () => {
      ticketService.validateTicket.mockResolvedValue({
        valid: true,
        message: 'Ticket validated successfully',
        ticket: { ...sampleTicket, status: 'used' },
      });

      const res = await request(app)
        .post('/api/tickets/validate')
        .send({ ticket_code: sampleTicket.ticket_code });

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(ticketService.validateTicket).toHaveBeenCalledWith(sampleTicket.ticket_code);
    });

    it('returns 404 for invalid ticket codes', async () => {
      ticketService.validateTicket.mockResolvedValue({
        valid: false,
        reason: 'not_found',
        message: 'Ticket not found',
      });

      const res = await request(app)
        .post('/api/tickets/validate')
        .send({ ticket_code: sampleTicket.ticket_code });

      expect(res.status).toBe(404);
      expect(res.body.valid).toBe(false);
    });

    it('returns 400 for malformed ticket_code', async () => {
      const res = await request(app)
        .post('/api/tickets/validate')
        .send({ ticket_code: 'not-a-uuid' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('DELETE /api/tickets/:id', () => {
    it('cancels a ticket for the authenticated passenger', async () => {
      ticketService.cancelTicket.mockResolvedValue({ ...sampleTicket, status: 'cancelled' });

      const res = await request(app)
        .delete('/api/tickets/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.ticket.status).toBe('cancelled');
      expect(ticketService.cancelTicket).toHaveBeenCalledWith(42, 1, mockProducer);
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app).delete('/api/tickets/1');

      expect(res.status).toBe(401);
    });

    it('returns 403 when cancelling another passenger ticket', async () => {
      const err = new Error('Not authorized to cancel this ticket');
      err.statusCode = 403;
      ticketService.cancelTicket.mockRejectedValue(err);

      const res = await request(app)
        .delete('/api/tickets/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/tickets', () => {
    it('lists bookings for the authenticated passenger', async () => {
      ticketService.listBookings.mockResolvedValue([sampleTicket]);

      const res = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.tickets).toHaveLength(1);
      expect(ticketService.listBookings).toHaveBeenCalledWith(42);
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/tickets');

      expect(res.status).toBe(401);
    });
  });
});
