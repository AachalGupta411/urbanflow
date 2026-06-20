'use strict';

const { getRedis } = require('../utils/redis');
const config = require('../config');

const EXEMPT_PATHS = new Set(['/health', '/ready', '/metrics']);

async function rateLimiter(req, res, next) {
  if (EXEMPT_PATHS.has(req.path)) {
    return next();
  }

  const serviceName = config.serviceName || 'urbanflow-service';
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const key = `rate:${serviceName}:${ip}`;
  const redis = getRedis();

  const maxRequests =
    config.nodeEnv === 'development'
      ? Math.max(config.rateLimit.maxRequests, 1000)
      : config.rateLimit.maxRequests;

  try {
    if (redis.status !== 'ready') await redis.connect();
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.pexpire(key, config.rateLimit.windowMs);
    }
    if (count > maxRequests) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));
    return next();
  } catch {
    // Fail open if Redis unavailable — availability over strict rate limiting
    return next();
  }
}

module.exports = rateLimiter;
