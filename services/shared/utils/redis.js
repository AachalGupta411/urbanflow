'use strict';

const Redis = require('ioredis');
const config = require('../config');
const logger = require('./logger');

let client = null;

function getRedis() {
  if (!client) {
    client = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    client.on('error', (err) => logger.error('Redis error', { error: err.message }));
  }
  return client;
}

async function healthCheck() {
  const redis = getRedis();
  if (redis.status !== 'ready') {
    await redis.connect();
  }
  const pong = await redis.ping();
  return pong === 'PONG';
}

module.exports = { getRedis, healthCheck };
