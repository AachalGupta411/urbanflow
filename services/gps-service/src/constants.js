'use strict';

module.exports = {
  KAFKA_TOPIC: process.env.KAFKA_GPS_TOPIC || 'gps-events',
  EVENT_TYPES: {
    COORDINATE: 'gps.coordinate',
    ROUTE_UPDATED: 'route.updated',
  },
  REDIS_KEY: {
    vehiclePosition: (vehicleId) => `gps:vehicle:${vehicleId}`,
  },
};
