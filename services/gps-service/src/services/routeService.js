'use strict';

const routeModel = require('../models/routeModel');
const { publishEvent } = require('@urbanflow/shared/utils/kafka');
const logger = require('@urbanflow/shared/utils/logger');
const { KAFKA_TOPIC, EVENT_TYPES } = require('../constants');

let producer = null;

function setProducer(kafkaProducer) {
  producer = kafkaProducer;
}

async function updateRoute(routeId, updates) {
  const route = await routeModel.update(routeId, updates);
  if (!route) {
    const error = new Error('Route not found');
    error.statusCode = 404;
    throw error;
  }

  if (producer) {
    try {
      await publishEvent(producer, KAFKA_TOPIC, EVENT_TYPES.ROUTE_UPDATED, {
        routeId: route.route_id,
        name: route.name,
        origin: route.origin,
        destination: route.destination,
        stops: route.stops,
        updatedAt: route.updated_at,
      });
    } catch (err) {
      logger.error('Failed to publish route.updated event', { error: err.message, routeId });
    }
  }

  return {
    routeId: route.route_id,
    name: route.name,
    origin: route.origin,
    destination: route.destination,
    stops: route.stops,
    updatedAt: route.updated_at,
  };
}

module.exports = { setProducer, updateRoute };
