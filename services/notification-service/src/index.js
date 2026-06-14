'use strict';

const config = require('@urbanflow/shared/config');
const { getPool } = require('@urbanflow/shared/utils/db');
const logger = require('@urbanflow/shared/utils/logger');
const { createApp } = require('./app');
const { startConsumer } = require('./consumers/kafkaConsumer');

const PORT = config.port;
let server = null;
let consumer = null;

async function start() {
  getPool({ database: process.env.MYSQL_DATABASE || 'notification_db' });

  try {
    consumer = await startConsumer();
  } catch (err) {
    logger.warn('Kafka consumer failed to start; API will run without event ingestion', {
      error: err.message,
    });
    consumer = null;
  }

  const app = createApp();
  server = app.listen(PORT, () => {
    logger.info('Notification service started', {
      port: PORT,
      env: config.nodeEnv,
      database: process.env.MYSQL_DATABASE || 'notification_db',
    });
  });

  return server;
}

async function shutdown(signal) {
  logger.info('Shutting down notification service', { signal });

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  if (consumer) {
    try {
      await consumer.disconnect();
    } catch (err) {
      logger.warn('Kafka consumer disconnect failed', { error: err.message });
    }
  }

  process.exit(0);
}

if (require.main === module) {
  start().catch((err) => {
    logger.error('Failed to start notification service', { error: err.message, stack: err.stack });
    process.exit(1);
  });

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = { start, shutdown, createApp };
