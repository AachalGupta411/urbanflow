'use strict';

const express = require('express');
const config = require('../../shared/config');
const logger = require('../../shared/utils/logger');
const rateLimiter = require('../../shared/middleware/rateLimiter');
const corsMiddleware = require('../../shared/middleware/cors');
const { metricsMiddleware, metricsHandler } = require('../../shared/middleware/metrics');
const { healthCheck: dbHealthCheck } = require('../../shared/utils/db');
const passengerRoutes = require('./routes/passengers');
const passengerService = require('./services/passengerService');
const { createProducer } = require('../../shared/utils/kafka');

const app = express();
let kafkaProducer = null;

app.set('trust proxy', 1);
app.use(corsMiddleware);
app.use(express.json());
app.use(metricsMiddleware);
app.use(rateLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: config.serviceName });
});

app.get('/ready', async (_req, res) => {
  try {
    const database = await dbHealthCheck();
    if (!database) {
      return res.status(503).json({ status: 'not ready', database: false });
    }
    return res.json({ status: 'ready', database: true });
  } catch (err) {
    logger.error('Readiness check failed', { error: err.message });
    return res.status(503).json({ status: 'not ready', error: err.message });
  }
});

app.get('/metrics', metricsHandler);
app.use('/api/passengers', passengerRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  try {
    kafkaProducer = createProducer();
    await kafkaProducer.connect();
    passengerService.setKafkaProducer(kafkaProducer);
    logger.info('Kafka producer connected');
  } catch (err) {
    logger.warn('Kafka unavailable; events will not be published', { error: err.message });
  }

  app.listen(config.port, () => {
    logger.info('Passenger service listening', {
      port: config.port,
      database: config.mysql.database,
    });
  });
}

async function shutdown() {
  if (kafkaProducer) {
    await kafkaProducer.disconnect();
  }
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

if (require.main === module) {
  start();
}

module.exports = { app, start };
