'use strict';

const { getRedis } = require('../utils/redis');
const config = require('../config');

async function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const key = `rate:${ip}`;
  const redis = getRedis();

  try {
    if (redis.status !== 'ready') await redis.connect();
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.pexpire(key, config.rateLimit.windowMs);
    }
    if (count > config.rateLimit.maxRequests) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    res.setHeader('X-RateLimit-Limit', config.rateLimit.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.rateLimit.maxRequests - count));
    return next();
  } catch {
    // Fail open if Redis unavailable — availability over strict rate limiting
    return next();
  }
}

module.exports = rateLimiter;
