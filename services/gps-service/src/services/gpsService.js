'use strict';

const coordinateModel = require('../models/coordinateModel');
const vehicleModel = require('../models/vehicleModel');
const { getRedis } = require('@urbanflow/shared/utils/redis');
const { publishEvent } = require('@urbanflow/shared/utils/kafka');
const logger = require('@urbanflow/shared/utils/logger');
const serviceConfig = require('../config');
const { KAFKA_TOPIC, EVENT_TYPES, REDIS_KEY } = require('../constants');

let producer = null;

function setProducer(kafkaProducer) {
  producer = kafkaProducer;
}

async function cachePosition(vehicleId, position) {
  const redis = getRedis();
  if (redis.status !== 'ready') {
    await redis.connect();
  }
  await redis.setex(
    REDIS_KEY.vehiclePosition(vehicleId),
    serviceConfig.redisTtlSeconds,
    JSON.stringify(position)
  );
}

async function getCachedPosition(vehicleId) {
  const redis = getRedis();
  if (redis.status !== 'ready') {
    await redis.connect();
  }
  const cached = await redis.get(REDIS_KEY.vehiclePosition(vehicleId));
  if (!cached) return null;

  try {
    return JSON.parse(cached);
  } catch {
    return null;
  }
}

async function recordCoordinate({ vehicleId, latitude, longitude, speed, heading }) {
  const vehicle = await vehicleModel.findByVehicleId(vehicleId);
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  const coordinate = await coordinateModel.insert({
    vehicleId,
    latitude,
    longitude,
    speed,
    heading,
  });

  const position = {
    vehicleId: coordinate.vehicle_id,
    latitude: Number(coordinate.latitude),
    longitude: Number(coordinate.longitude),
    speed: Number(coordinate.speed),
    heading: Number(coordinate.heading),
    recordedAt: coordinate.recorded_at,
  };

  await cachePosition(vehicleId, position);

  if (producer) {
    try {
      await publishEvent(producer, KAFKA_TOPIC, EVENT_TYPES.COORDINATE, {
        id: coordinate.id,
        vehicleId: coordinate.vehicle_id,
        latitude: position.latitude,
        longitude: position.longitude,
        speed: position.speed,
        heading: position.heading,
        recordedAt: coordinate.recorded_at,
        routeId: vehicle.route_id,
      });
    } catch (err) {
      logger.error('Failed to publish gps.coordinate event', { error: err.message, vehicleId });
    }
  }

  return { coordinate, vehicle };
}

module.exports = {
  setProducer,
  cachePosition,
  getCachedPosition,
  recordCoordinate,
};
