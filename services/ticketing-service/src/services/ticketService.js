'use strict';

const { v4: uuidv4 } = require('uuid');
const ticketModel = require('../models/ticketModel');
const { publishEvent } = require('../../../shared/utils/kafka');
const { getRedis } = require('../../../shared/utils/redis');
const logger = require('../../../shared/utils/logger');

const KAFKA_TOPIC = 'ticket-events';
const CACHE_PREFIX = 'ticket:validate:';
const CACHE_TTL_SECONDS = 60;

function cacheKey(ticketCode) {
  return `${CACHE_PREFIX}${ticketCode}`;
}

async function getCachedValidation(ticketCode) {
  try {
    const redis = getRedis();
    if (redis.status !== 'ready') await redis.connect();
    const cached = await redis.get(cacheKey(ticketCode));
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    logger.warn('Redis cache read failed', { error: err.message });
    return null;
  }
}

async function setCachedValidation(ticketCode, result) {
  try {
    const redis = getRedis();
    if (redis.status !== 'ready') await redis.connect();
    await redis.setex(cacheKey(ticketCode), CACHE_TTL_SECONDS, JSON.stringify(result));
  } catch (err) {
    logger.warn('Redis cache write failed', { error: err.message });
  }
}

async function invalidateCache(ticketCode) {
  try {
    const redis = getRedis();
    if (redis.status !== 'ready') await redis.connect();
    await redis.del(cacheKey(ticketCode));
  } catch (err) {
    logger.warn('Redis cache invalidation failed', { error: err.message });
  }
}

function toPublicTicket(ticket) {
  return {
    id: ticket.id,
    passenger_id: ticket.passenger_id,
    route_id: ticket.route_id,
    vehicle_type: ticket.vehicle_type,
    origin: ticket.origin,
    destination: ticket.destination,
    fare: ticket.fare,
    status: ticket.status,
    ticket_code: ticket.ticket_code,
    travel_date: ticket.travel_date,
    created_at: ticket.created_at,
    updated_at: ticket.updated_at,
  };
}

async function createTicket(passengerId, data, producer) {
  const ticket = await ticketModel.create({
    passenger_id: passengerId,
    route_id: data.route_id,
    vehicle_type: data.vehicle_type || 'bus',
    origin: data.origin,
    destination: data.destination,
    fare: data.fare,
    status: 'active',
    ticket_code: uuidv4(),
    travel_date: data.travel_date,
  });

  const payload = toPublicTicket(ticket);
  await publishEvent(producer, KAFKA_TOPIC, 'ticket.created', payload);

  return payload;
}

async function validateTicket(ticketCode) {
  const cached = await getCachedValidation(ticketCode);
  if (cached) {
    return cached;
  }

  const ticket = await ticketModel.findByCode(ticketCode);
  if (!ticket) {
    const result = { valid: false, reason: 'not_found', message: 'Ticket not found' };
    await setCachedValidation(ticketCode, result);
    return result;
  }

  if (ticket.status === 'cancelled') {
    const result = { valid: false, reason: 'cancelled', message: 'Ticket has been cancelled' };
    await setCachedValidation(ticketCode, result);
    return result;
  }

  if (ticket.status === 'used') {
    const result = { valid: false, reason: 'already_used', message: 'Ticket has already been used' };
    await setCachedValidation(ticketCode, result);
    return result;
  }

  const updated = await ticketModel.updateStatus(ticket.id, 'used');
  await invalidateCache(ticketCode);

  const result = {
    valid: true,
    message: 'Ticket validated successfully',
    ticket: toPublicTicket(updated),
  };
  await setCachedValidation(ticketCode, result);
  return result;
}

async function cancelTicket(passengerId, ticketId, producer) {
  const ticket = await ticketModel.findById(ticketId);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  if (ticket.passenger_id !== passengerId) {
    const error = new Error('Not authorized to cancel this ticket');
    error.statusCode = 403;
    throw error;
  }

  if (ticket.status === 'cancelled') {
    const error = new Error('Ticket is already cancelled');
    error.statusCode = 409;
    throw error;
  }

  if (ticket.status === 'used') {
    const error = new Error('Cannot cancel a ticket that has been used');
    error.statusCode = 409;
    throw error;
  }

  const updated = await ticketModel.updateStatus(ticket.id, 'cancelled');
  await invalidateCache(ticket.ticket_code);

  const payload = toPublicTicket(updated);
  await publishEvent(producer, KAFKA_TOPIC, 'ticket.cancelled', payload);

  return payload;
}

async function listBookings(passengerId) {
  const tickets = await ticketModel.findByPassengerId(passengerId);
  return tickets.map(toPublicTicket);
}

module.exports = {
  createTicket,
  validateTicket,
  cancelTicket,
  listBookings,
  KAFKA_TOPIC,
  CACHE_PREFIX,
};
