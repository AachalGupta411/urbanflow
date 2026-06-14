'use strict';

const express = require('express');
const config = require('./config');
const logger = require('../../shared/utils/logger');
const { getPool, healthCheck: dbHealthCheck } = require('../../shared/utils/db');
const { healthCheck: redisHealthCheck } = require('../../shared/utils/redis');
const { metricsMiddleware, metricsHandler } = require('../../shared/middleware/metrics');
const rateLimiter = require('../../shared/middleware/rateLimiter');
const corsMiddleware = require('../../shared/middleware/cors');
const analyticsRoutes = require('./routes/analytics');
const { startAnalyticsConsumer } = require('./consumers/analyticsConsumer');

function createApp(options = {}) {
  const { enableRateLimit = true } = options;
  const app = express();

  app.set('trust proxy', 1);
  app.use(corsMiddleware);
  app.use(express.json({ limit: '1mb' }));
  app.use(metricsMiddleware);
  if (enableRateLimit) {
    app.use(rateLimiter);
  }

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: config.serviceName });
  });

  app.get('/ready', async (_req, res) => {
    const checks = { mysql: false, redis: false, kafka: false };

    try {
      checks.mysql = await dbHealthCheck();
    } catch (err) {
      logger.error('MySQL readiness check failed', { error: err.message });
    }

    try {
      checks.redis = await redisHealthCheck();
    } catch (err) {
      logger.error('Redis readiness check failed', { error: err.message });
    }

    try {
      checks.kafka = app.locals.kafkaConsumer !== null;
    } catch (err) {
      logger.error('Kafka readiness check failed', { error: err.message });
    }

    const ready = checks.mysql && checks.redis;
    res.status(ready ? 200 : 503).json({
      status: ready ? 'ready' : 'not_ready',
      service: config.serviceName,
      checks,
    });
  });

  app.get('/metrics', metricsHandler);
  app.use('/api/analytics', analyticsRoutes);

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

async function start() {
  getPool();

  let kafkaConsumer = null;
  try {
    kafkaConsumer = await startAnalyticsConsumer();
  } catch (err) {
    logger.warn('Kafka consumer failed to start; API will run without event ingestion', {
      error: err.message,
    });
  }

  const app = createApp();
  app.locals.kafkaConsumer = kafkaConsumer;

  const server = app.listen(config.port, () => {
    logger.info('Analytics service started', {
      port: config.port,
      env: config.nodeEnv,
      database: config.mysql.database,
      kafka: Boolean(kafkaConsumer),
    });
  });

  const shutdown = async (signal) => {
    logger.info('Shutdown signal received', { signal });
    server.close(async () => {
      if (kafkaConsumer) {
        try {
          await kafkaConsumer.disconnect();
          logger.info('Kafka consumer disconnected');
        } catch (err) {
          logger.error('Error disconnecting Kafka consumer', { error: err.message });
        }
      }
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return { app, server, kafkaConsumer };
}

if (require.main === module) {
  start().catch((err) => {
    logger.error('Failed to start analytics service', { error: err.message, stack: err.stack });
    process.exit(1);
  });
}

module.exports = { createApp, start };
