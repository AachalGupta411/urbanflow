'use strict';

module.exports = {
  TOPICS: {
    GPS: process.env.KAFKA_GPS_TOPIC || 'gps-events',
    TICKET: process.env.KAFKA_TICKET_TOPIC || 'ticket-events',
    PASSENGER: process.env.KAFKA_PASSENGER_TOPIC || 'passenger-events',
  },
  EVENT_TYPES: {
    TICKET_CREATED: 'ticket.created',
    TICKET_CANCELLED: 'ticket.cancelled',
    GPS_COORDINATE: 'gps.coordinate',
    ROUTE_UPDATED: 'route.updated',
    PASSENGER_REGISTERED: 'passenger.registered',
    PASSENGER_LOGIN: 'passenger.login',
  },
  CACHE: {
    PREFIX: 'analytics:',
    TTL_SECONDS: parseInt(process.env.ANALYTICS_CACHE_TTL || '3600', 10),
  },
  CONSUMER_GROUP: process.env.KAFKA_ANALYTICS_GROUP || 'analytics-service-group',
};
