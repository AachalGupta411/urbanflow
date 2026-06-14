'use strict';

jest.mock('bcrypt');
jest.mock('../../src/models/passengerModel', () => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
}));
jest.mock('../../../shared/middleware/auth', () => ({
  signToken: jest.fn(() => 'mock-jwt-token'),
  authenticate: jest.fn(),
}));

const bcrypt = require('bcrypt');
const passengerModel = require('../../src/models/passengerModel');
const { signToken } = require('../../../shared/middleware/auth');
const passengerService = require('../../src/services/passengerService');

describe('passengerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const payload = {
      email: 'jane@example.com',
      password: 'securepass1',
      fullName: 'Jane Doe',
      phone: '+15551234567',
    };

    it('hashes password with bcrypt cost 12 and returns token', async () => {
      passengerModel.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-password');
      passengerModel.create.mockResolvedValue({
        id: 1,
        email: payload.email,
        full_name: payload.fullName,
        phone: payload.phone,
      });

      const result = await passengerService.register(payload);

      expect(bcrypt.hash).toHaveBeenCalledWith(payload.password, 12);
      expect(passengerModel.create).toHaveBeenCalledWith({
        email: payload.email,
        passwordHash: 'hashed-password',
        fullName: payload.fullName,
        phone: payload.phone,
      });
      expect(signToken).toHaveBeenCalledWith({ id: 1, email: payload.email });
      expect(result).toEqual({
        token: 'mock-jwt-token',
        passenger: {
          id: 1,
          email: payload.email,
          full_name: payload.fullName,
          phone: payload.phone,
        },
      });
    });

    it('throws ConflictError when email already exists', async () => {
      passengerModel.findByEmail.mockResolvedValue({ id: 99, email: payload.email });

      await expect(passengerService.register(payload)).rejects.toMatchObject({
        name: 'ConflictError',
        statusCode: 409,
        message: 'Email already registered',
      });
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const credentials = { email: 'jane@example.com', password: 'securepass1' };

    it('returns token and passenger without password hash on valid credentials', async () => {
      passengerModel.findByEmail.mockResolvedValue({
        id: 1,
        email: credentials.email,
        password_hash: 'hashed-password',
        full_name: 'Jane Doe',
        phone: '+15551234567',
      });
      bcrypt.compare.mockResolvedValue(true);

      const result = await passengerService.login(credentials);

      expect(bcrypt.compare).toHaveBeenCalledWith(credentials.password, 'hashed-password');
      expect(signToken).toHaveBeenCalledWith({ id: 1, email: credentials.email });
      expect(result.passenger).not.toHaveProperty('password_hash');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('throws AuthError when email is not found', async () => {
      passengerModel.findByEmail.mockResolvedValue(null);

      await expect(passengerService.login(credentials)).rejects.toMatchObject({
        name: 'AuthError',
        statusCode: 401,
      });
    });

    it('throws AuthError when password is invalid', async () => {
      passengerModel.findByEmail.mockResolvedValue({
        id: 1,
        email: credentials.email,
        password_hash: 'hashed-password',
      });
      bcrypt.compare.mockResolvedValue(false);

      await expect(passengerService.login(credentials)).rejects.toMatchObject({
        name: 'AuthError',
        statusCode: 401,
      });
    });
  });

  describe('getProfile', () => {
    it('returns passenger profile by id', async () => {
      const profile = { id: 1, email: 'jane@example.com', full_name: 'Jane Doe', phone: null };
      passengerModel.findById.mockResolvedValue(profile);

      await expect(passengerService.getProfile(1)).resolves.toEqual(profile);
    });

    it('throws NotFoundError when passenger does not exist', async () => {
      passengerModel.findById.mockResolvedValue(null);

      await expect(passengerService.getProfile(404)).rejects.toMatchObject({
        name: 'NotFoundError',
        statusCode: 404,
      });
    });
  });

  describe('updateProfile', () => {
    it('updates and returns passenger profile', async () => {
      const updated = {
        id: 1,
        email: 'jane@example.com',
        full_name: 'Jane Smith',
        phone: '+15559876543',
      };
      passengerModel.findById.mockResolvedValue({ id: 1 });
      passengerModel.update.mockResolvedValue(updated);

      await expect(
        passengerService.updateProfile(1, { fullName: 'Jane Smith', phone: '+15559876543' })
      ).resolves.toEqual(updated);

      expect(passengerModel.update).toHaveBeenCalledWith(1, {
        fullName: 'Jane Smith',
        phone: '+15559876543',
      });
    });

    it('throws NotFoundError when passenger does not exist', async () => {
      passengerModel.findById.mockResolvedValue(null);

      await expect(
        passengerService.updateProfile(99, { fullName: 'Nobody', phone: null })
      ).rejects.toMatchObject({
        name: 'NotFoundError',
        statusCode: 404,
      });
    });
  });

  it('exports bcrypt cost factor of 12', () => {
    expect(passengerService.BCRYPT_ROUNDS).toBe(12);
  });
});
