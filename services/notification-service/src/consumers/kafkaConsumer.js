'use strict';

const { createConsumer } = require('../../../shared/utils/kafka');
const { getRedis } = require('../../../shared/utils/redis');
const logger = require('../../../shared/utils/logger');
const notificationService = require('../services/notificationService');
const { TOPICS, CONSUMER_GROUP, DEDUP_PREFIX, DEDUP_TTL_SECONDS } = require('../constants');

function buildDedupKey(topic, eventType, payload) {
  const parts = [topic, eventType];

  if (payload.id) parts.push(String(payload.id));
  if (payload.vehicleId) parts.push(String(payload.vehicleId));
  if (payload.routeId || payload.route_id) parts.push(String(payload.routeId || payload.route_id));
  if (payload.ticket_code || payload.ticketCode) {
    parts.push(String(payload.ticket_code || payload.ticketCode));
  }
  if (payload.passenger_id || payload.passengerId) {
    parts.push(String(payload.passenger_id || payload.passengerId));
  }

  return `${DEDUP_PREFIX}${parts.join(':')}`;
}

async function isDuplicate(key) {
  try {
    const redis = getRedis();
    if (redis.status !== 'ready') await redis.connect();

    const exists = await redis.get(key);
    if (exists) return true;

    await redis.setex(key, DEDUP_TTL_SECONDS, '1');
    return false;
  } catch (err) {
    logger.warn('Notification dedup check failed; proceeding without dedup', { error: err.message });
    return false;
  }
}

async function handleEvent(topic, event) {
  const eventType = event.eventType;
  const payload = event.payload || {};

  if (!eventType) {
    logger.warn('Skipping Kafka message without eventType', { topic });
    return null;
  }

  const dedupKey = buildDedupKey(topic, eventType, payload);
  if (await isDuplicate(dedupKey)) {
    logger.debug('Skipping duplicate notification event', { topic, eventType, dedupKey });
    return null;
  }

  if (topic === TOPICS.GPS) {
    return notificationService.handleGpsEvent(eventType, payload);
  }

  if (topic === TOPICS.TICKET) {
    return notificationService.handleTicketEvent(eventType, payload);
  }

  if (topic === TOPICS.SYSTEM) {
    return notificationService.handleSystemEvent(eventType, payload);
  }

  logger.warn('Unhandled Kafka topic', { topic, eventType });
  return null;
}

async function startConsumer() {
  const consumer = createConsumer(CONSUMER_GROUP);
  const topics = [TOPICS.GPS, TOPICS.TICKET, TOPICS.SYSTEM];

  await consumer.connect();
  await consumer.subscribe({ topics, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const raw = message.value ? message.value.toString() : null;
        if (!raw) return;

        const event = JSON.parse(raw);
        const notification = await handleEvent(topic, event);

        if (notification) {
          logger.info('Notification created from Kafka event', {
            topic,
            eventType: event.eventType,
            notificationId: notification.id,
            type: notification.type,
          });
        }
      } catch (err) {
        logger.error('Failed to process Kafka message', {
          topic,
          error: err.message,
        });
      }
    },
  });

  logger.info('Kafka consumer started', { topics, groupId: CONSUMER_GROUP });
  return consumer;
}

module.exports = {
  startConsumer,
  handleEvent,
  buildDedupKey,
  isDuplicate,
};
