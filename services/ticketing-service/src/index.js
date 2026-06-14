'use strict';

const express = require('express');
const config = require('../../shared/config');
const logger = require('../../shared/utils/logger');
const { getPool, healthCheck: dbHealthCheck } = require('../../shared/utils/db');
const { healthCheck: redisHealthCheck } = require('../../shared/utils/redis');
const { createProducer } = require('../../shared/utils/kafka');
const { metricsMiddleware, metricsHandler } = require('../../shared/middleware/metrics');
const rateLimiter = require('../../shared/middleware/rateLimiter');
const corsMiddleware = require('../../shared/middleware/cors');
const ticketRoutes = require('./routes/tickets');

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
      checks.kafka = app.locals.kafkaProducer !== null;
    } catch (err) {
      logger.error('Kafka readiness check failed', { error: err.message });
    }

    const ready = checks.mysql && checks.redis && checks.kafka;
    res.status(ready ? 200 : 503).json({
      status: ready ? 'ready' : 'not_ready',
      service: config.serviceName,
      checks,
    });
  });

  app.get('/metrics', metricsHandler);
  app.use('/api/tickets', ticketRoutes);

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

async function connectKafka() {
  const producer = createProducer();
  await producer.connect();
  logger.info('Kafka producer connected', { brokers: config.kafka.brokers });
  return producer;
}

async function start() {
  getPool();
  const kafkaProducer = await connectKafka();
  const app = createApp();
  app.locals.kafkaProducer = kafkaProducer;

  const server = app.listen(config.port, () => {
    logger.info('Ticketing service started', {
      port: config.port,
      env: config.nodeEnv,
      database: config.mysql.database,
    });
  });

  const shutdown = async (signal) => {
    logger.info('Shutdown signal received', { signal });
    server.close(async () => {
      try {
        await kafkaProducer.disconnect();
        logger.info('Kafka producer disconnected');
      } catch (err) {
        logger.error('Error disconnecting Kafka producer', { error: err.message });
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

  return { app, server, kafkaProducer };
}

if (require.main === module) {
  start().catch((err) => {
    logger.error('Failed to start ticketing service', { error: err.message, stack: err.stack });
    process.exit(1);
  });
}

module.exports = { createApp, start, connectKafka };
