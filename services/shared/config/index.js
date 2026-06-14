'use strict';

/**
 * Centralized environment configuration.
 * All services read from process.env with sensible local defaults.
 */
const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  jwt: {
    secret: process.env.JWT_SECRET || 'urbanflow-dev-secret-change-in-prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'urbanflow',
    password: process.env.MYSQL_PASSWORD || 'urbanflow_pass',
    database: process.env.MYSQL_DATABASE || 'urbanflow',
    connectionLimit: parseInt(process.env.MYSQL_POOL_SIZE || '10', 10),
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'urbanflow-service',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  serviceName: process.env.SERVICE_NAME || 'urbanflow-service',
  port: parseInt(process.env.PORT || '3000', 10),
};

module.exports = config;
