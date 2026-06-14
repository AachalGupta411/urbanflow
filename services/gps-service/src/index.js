'use strict';

const config = require('@urbanflow/shared/config');
const { createProducer } = require('@urbanflow/shared/utils/kafka');
const { getPool } = require('@urbanflow/shared/utils/db');
const logger = require('@urbanflow/shared/utils/logger');
const { createApp } = require('./app');
const gpsService = require('./services/gpsService');
const routeService = require('./services/routeService');

const PORT = config.port;
let server = null;
let producer = null;

async function start() {
  getPool({ database: process.env.MYSQL_DATABASE || 'gps_db' });

  producer = createProducer();
  try {
    await producer.connect();
    logger.info('Kafka producer connected');
  } catch (err) {
    logger.warn('Kafka producer connection failed; events will not be published', {
      error: err.message,
    });
    producer = null;
  }

  gpsService.setProducer(producer);
  routeService.setProducer(producer);

  const app = createApp();
  server = app.listen(PORT, () => {
    logger.info('GPS service started', { port: PORT, env: config.nodeEnv });
  });

  return server;
}

async function shutdown(signal) {
  logger.info('Shutting down GPS service', { signal });

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  if (producer) {
    try {
      await producer.disconnect();
    } catch (err) {
      logger.warn('Kafka producer disconnect failed', { error: err.message });
    }
  }

  process.exit(0);
}

if (require.main === module) {
  start().catch((err) => {
    logger.error('Failed to start GPS service', { error: err.message, stack: err.stack });
    process.exit(1);
  });

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = { start, shutdown, createApp };
