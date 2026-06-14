'use strict';

const { Kafka, logLevel } = require('kafkajs');
const config = require('../config');
const logger = require('./logger');

let kafkaInstance = null;

function getKafka() {
  if (!kafkaInstance) {
    kafkaInstance = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      logLevel: logLevel.ERROR,
      retry: { initialRetryTime: 300, retries: 8 },
    });
  }
  return kafkaInstance;
}

function createProducer() {
  return getKafka().producer();
}

function createConsumer(groupId) {
  return getKafka().consumer({ groupId });
}

async function publishEvent(producer, topic, eventType, payload) {
  await producer.send({
    topic,
    messages: [
      {
        key: payload.id ? String(payload.id) : undefined,
        value: JSON.stringify({
          eventType,
          timestamp: new Date().toISOString(),
          payload,
        }),
      },
    ],
  });
  logger.info('Kafka event published', { topic, eventType });
}

module.exports = { getKafka, createProducer, createConsumer, publishEvent };
