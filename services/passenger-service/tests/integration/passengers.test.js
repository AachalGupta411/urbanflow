'use strict';

process.env.SERVICE_NAME = 'passenger-service';
process.env.PORT = '3002';
process.env.MYSQL_DATABASE = 'passenger_db';
process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../../../shared/utils/db', () => ({
  healthCheck: jest.fn().mockResolvedValue(true),
  query: jest.fn(),
  getPool: jest.fn(),
  createPool: jest.fn(),
}));

jest.mock('../../../shared/utils/redis', () => ({
  getRedis: jest.fn(() => ({
    status: 'ready',
    incr: jest.fn().mockResolvedValue(1),
    pexpire: jest.fn().mockResolvedValue(1),
    connect: jest.fn(),
  })),
  healthCheck: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../src/models/passengerModel');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const passengerModel = require('../../src/models/passengerModel');
const { app } = require('../../src/index');

const JWT_SECRET = process.env.JWT_SECRET;

function authHeader(passengerId, email) {
  const token = jwt.sign({ id: passengerId, email }, JWT_SECRET, { expiresIn: '1h' });
  return { Authorization: `Bearer ${token}` };
}

describe('Passenger API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('returns service health status', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok', service: 'passenger-service' });
    });
  });

  describe('GET /ready', () => {
    it('returns ready when database is available', async () => {
      const res = await request(app).get('/ready');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ready', database: true });
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

  describe('POST /api/passengers/register', () => {
    it('registers a new passenger and returns JWT', async () => {
      passengerModel.findByEmail.mockResolvedValue(null);
      passengerModel.create.mockResolvedValue({
        id: 1,
        email: 'newuser@example.com',
        full_name: 'New User',
        phone: '+15551230000',
      });

      const res = await request(app).post('/api/passengers/register').send({
        email: 'newuser@example.com',
        password: 'password123',
        full_name: 'New User',
        phone: '+15551230000',
      });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.passenger).toMatchObject({
        id: 1,
        email: 'newuser@example.com',
        full_name: 'New User',
      });
    });

    it('returns 400 for invalid registration payload', async () => {
      const res = await request(app).post('/api/passengers/register').send({
        email: 'not-an-email',
        password: 'short',
        full_name: '',
      });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('returns 409 when email is already registered', async () => {
      passengerModel.findByEmail.mockResolvedValue({ id: 2, email: 'existing@example.com' });

      const res = await request(app).post('/api/passengers/register').send({
        email: 'existing@example.com',
        password: 'password123',
        full_name: 'Existing User',
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Email already registered');
    });
  });

  describe('POST /api/passengers/login', () => {
    it('returns JWT on successful login', async () => {
      passengerModel.findByEmail.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYKrjOqGJKuG',
        full_name: 'Test User',
        phone: null,
      });

      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const res = await request(app).post('/api/passengers/login').send({
        email: 'user@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.passenger).not.toHaveProperty('password_hash');
    });

    it('returns 401 for invalid credentials', async () => {
      passengerModel.findByEmail.mockResolvedValue(null);

      const res = await request(app).post('/api/passengers/login').send({
        email: 'missing@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid email or password');
    });
  });

  describe('GET /api/passengers/profile', () => {
    it('returns profile for authenticated user', async () => {
      passengerModel.findById.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        full_name: 'Test User',
        phone: '+15551234567',
      });

      const res = await request(app)
        .get('/api/passengers/profile')
        .set(authHeader(1, 'user@example.com'));

      expect(res.status).toBe(200);
      expect(res.body.passenger).toMatchObject({
        id: 1,
        email: 'user@example.com',
        full_name: 'Test User',
      });
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/passengers/profile');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });
  });

  describe('PUT /api/passengers/profile', () => {
    it('updates profile for authenticated user', async () => {
      passengerModel.findById.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        full_name: 'Old Name',
        phone: null,
      });
      passengerModel.update.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        full_name: 'Updated Name',
        phone: '+15559998888',
      });

      const res = await request(app)
        .put('/api/passengers/profile')
        .set(authHeader(1, 'user@example.com'))
        .send({ full_name: 'Updated Name', phone: '+15559998888' });

      expect(res.status).toBe(200);
      expect(res.body.passenger.full_name).toBe('Updated Name');
      expect(res.body.passenger.phone).toBe('+15559998888');
    });

    it('returns 400 for invalid profile update', async () => {
      const res = await request(app)
        .put('/api/passengers/profile')
        .set(authHeader(1, 'user@example.com'))
        .send({ full_name: '' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });
});
