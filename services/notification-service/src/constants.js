'use strict';

module.exports = {
  TOPICS: {
    GPS: process.env.KAFKA_GPS_TOPIC || 'gps-events',
    TICKET: process.env.KAFKA_TICKET_TOPIC || 'ticket-events',
    SYSTEM: process.env.KAFKA_SYSTEM_TOPIC || 'system-events',
  },
  EVENT_TYPES: {
    GPS_COORDINATE: 'gps.coordinate',
    ROUTE_UPDATED: 'route.updated',
    TICKET_CREATED: 'ticket.created',
    TICKET_CANCELLED: 'ticket.cancelled',
    SYSTEM_ANNOUNCEMENT: 'system.announcement',
  },
  NOTIFICATION_TYPES: {
    DELAY: 'delay',
    ROUTE_CHANGE: 'route_change',
    SYSTEM: 'system',
  },
  CONSUMER_GROUP: process.env.KAFKA_CONSUMER_GROUP || 'notification-service-group',
  DEDUP_PREFIX: 'notification:dedup:',
  DEDUP_TTL_SECONDS: parseInt(process.env.NOTIFICATION_DEDUP_TTL || '300', 10),
};
