'use strict';

const bcrypt = require('bcrypt');
const passengerModel = require('../models/passengerModel');
const { signToken } = require('../../../shared/middleware/auth');
const { publishEvent } = require('../../../shared/utils/kafka');

const KAFKA_TOPIC = 'passenger-events';
let kafkaProducer = null;

function setKafkaProducer(producer) {
  kafkaProducer = producer;
}

const BCRYPT_ROUNDS = 12;

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = 401;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

function toPublicPassenger(passenger) {
  if (!passenger) return null;
  const { password_hash: _passwordHash, ...publicFields } = passenger;
  return publicFields;
}

async function register({ email, password, fullName, phone }) {
  const existing = await passengerModel.findByEmail(email);
  if (existing) {
    throw new ConflictError('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const passenger = await passengerModel.create({
    email,
    passwordHash,
    fullName,
    phone,
  });

  const token = signToken({ id: passenger.id, email: passenger.email });
  if (kafkaProducer) {
    await publishEvent(kafkaProducer, KAFKA_TOPIC, 'passenger.registered', {
      id: passenger.id,
      email: passenger.email,
    });
  }
  return { token, passenger };
}

async function login({ email, password }) {
  const record = await passengerModel.findByEmail(email);
  if (!record) {
    throw new AuthError('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, record.password_hash);
  if (!valid) {
    throw new AuthError('Invalid email or password');
  }

  const token = signToken({ id: record.id, email: record.email });
  if (kafkaProducer) {
    await publishEvent(kafkaProducer, KAFKA_TOPIC, 'passenger.login', {
      id: record.id,
      email: record.email,
    });
  }
  return { token, passenger: toPublicPassenger(record) };
}

async function getProfile(id) {
  const passenger = await passengerModel.findById(id);
  if (!passenger) {
    throw new NotFoundError('Passenger not found');
  }
  return passenger;
}

async function updateProfile(id, { fullName, phone }) {
  const existing = await passengerModel.findById(id);
  if (!existing) {
    throw new NotFoundError('Passenger not found');
  }
  return passengerModel.update(id, { fullName, phone });
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  setKafkaProducer,
  ConflictError,
  AuthError,
  NotFoundError,
  BCRYPT_ROUNDS,
};
