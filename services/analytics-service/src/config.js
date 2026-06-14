'use strict';

const sharedConfig = require('../../shared/config');

module.exports = {
  ...sharedConfig,
  cacheTtlSeconds: parseInt(process.env.ANALYTICS_CACHE_TTL || '3600', 10),
  consumerGroup: process.env.KAFKA_ANALYTICS_GROUP || 'analytics-service-group',
};
