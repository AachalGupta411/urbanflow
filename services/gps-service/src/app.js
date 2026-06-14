'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimiter = require('@urbanflow/shared/middleware/rateLimiter');
const { metricsMiddleware, metricsHandler } = require('@urbanflow/shared/middleware/metrics');
const { healthCheck: dbHealthCheck } = require('@urbanflow/shared/utils/db');
const { healthCheck: redisHealthCheck } = require('@urbanflow/shared/utils/redis');
const logger = require('@urbanflow/shared/utils/logger');
const gpsRoutes = require('./routes/gps');

function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(rateLimiter);
  app.use(metricsMiddleware);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: process.env.SERVICE_NAME || 'gps-service' });
  });

  app.get('/ready', async (_req, res) => {
    const checks = { mysql: false, redis: false };

    try {
      checks.mysql = await dbHealthCheck();
    } catch (err) {
      logger.warn('MySQL readiness check failed', { error: err.message });
    }

    try {
      checks.redis = await redisHealthCheck();
    } catch (err) {
      logger.warn('Redis readiness check failed', { error: err.message });
    }

    const ready = checks.mysql && checks.redis;
    return res.status(ready ? 200 : 503).json({
      status: ready ? 'ready' : 'not_ready',
      checks,
    });
  });

  app.get('/metrics', metricsHandler);
  app.use('/api/gps', gpsRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use((err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    if (statusCode >= 500) {
      logger.error('Unhandled error', { error: err.message, stack: err.stack });
    }
    res.status(statusCode).json({
      error: statusCode >= 500 ? 'Internal server error' : err.message,
    });
  });

  return app;
}

module.exports = { createApp };
