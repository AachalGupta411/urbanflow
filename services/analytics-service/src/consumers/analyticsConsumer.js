'use strict';

const analyticsService = require('../services/analyticsService');
const logger = require('../../../shared/utils/logger');
const { TOPICS, EVENT_TYPES, CONSUMER_GROUP } = require('../constants');

async function handleMessage(message) {
  if (!message.value) {
    return;
  }

  let envelope;
  try {
    envelope = JSON.parse(message.value.toString());
  } catch (err) {
    logger.warn('Invalid Kafka message payload', { error: err.message });
    return;
  }

  const { eventType, timestamp, payload } = envelope;
  if (!eventType || !payload) {
    logger.warn('Kafka message missing eventType or payload');
    return;
  }

  await analyticsService.processEvent(eventType, timestamp, payload);
  logger.info('Analytics event processed', { eventType });
}

async function startAnalyticsConsumer() {
  const { createConsumer } = require('../../../shared/utils/kafka');
  const consumer = createConsumer(CONSUMER_GROUP);
  const topics = [TOPICS.GPS, TOPICS.TICKET, TOPICS.PASSENGER];

  let lastError;
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      await consumer.connect();
      await consumer.subscribe({ topics, fromBeginning: false });
      await consumer.run({
        eachMessage: async ({ message }) => {
          try {
            await handleMessage(message);
          } catch (err) {
            logger.error('Failed to process analytics event', {
              error: err.message,
              stack: err.stack,
            });
          }
        },
      });
      logger.info('Analytics Kafka consumer started', { group: CONSUMER_GROUP, topics });
      return consumer;
    } catch (err) {
      lastError = err;
      logger.warn('Kafka consumer connect attempt failed', { attempt, error: err.message });
      await new Promise((r) => setTimeout(r, Math.min(attempt * 2000, 10000)));
    }
  }

  throw lastError;
}

module.exports = {
  handleMessage,
  startAnalyticsConsumer,
  EVENT_TYPES,
  TOPICS,
};
