'use strict';

module.exports = {
  kafkaTopic: process.env.KAFKA_GPS_TOPIC || 'gps-events',
  redisTtlSeconds: parseInt(process.env.GPS_CACHE_TTL || '30', 10),
  apiKey: process.env.GPS_API_KEY || 'urbanflow-gps-dev-key',
  defaultTrackLimit: parseInt(process.env.GPS_TRACK_DEFAULT_LIMIT || '100', 10),
  maxTrackLimit: parseInt(process.env.GPS_TRACK_MAX_LIMIT || '1000', 10),
};
