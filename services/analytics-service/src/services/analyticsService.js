'use strict';

const crypto = require('crypto');
const analyticsModel = require('../models/analyticsModel');
const { getRedis } = require('../../../shared/utils/redis');
const logger = require('../../../shared/utils/logger');
const serviceConfig = require('../config');
const { CACHE } = require('../constants');

function toStatDate(timestamp) {
  if (!timestamp) {
    return new Date().toISOString().slice(0, 10);
  }
  return String(timestamp).slice(0, 10);
}

function resolveRouteId(payload) {
  return payload.route_id || payload.routeId || null;
}

function defaultDateRange(query) {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  return {
    from: query.from || thirtyDaysAgo,
    to: query.to || today,
  };
}

function cacheKey(resource, params) {
  const hourBucket = new Date().toISOString().slice(0, 13);
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(params))
    .digest('hex')
    .slice(0, 16);
  return `${CACHE.PREFIX}${resource}:${hourBucket}:${hash}`;
}

async function getCached(key) {
  try {
    const redis = getRedis();
    if (redis.status !== 'ready') await redis.connect();
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    logger.warn('Analytics cache read failed', { error: err.message });
    return null;
  }
}

async function setCached(key, data) {
  try {
    const redis = getRedis();
    if (redis.status !== 'ready') await redis.connect();
    await redis.setex(key, serviceConfig.cacheTtlSeconds, JSON.stringify(data));
  } catch (err) {
    logger.warn('Analytics cache write failed', { error: err.message });
  }
}

async function invalidateCache(resource) {
  try {
    const redis = getRedis();
    if (redis.status !== 'ready') await redis.connect();

    const pattern = resource ? `${CACHE.PREFIX}${resource}:*` : `${CACHE.PREFIX}*`;
    let cursor = '0';

    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  } catch (err) {
    logger.warn('Analytics cache invalidation failed', { error: err.message });
  }
}

async function getPassengerAnalytics(query) {
  const { from, to } = defaultDateRange(query);
  const key = cacheKey('passengers', { from, to });
  const cached = await getCached(key);
  if (cached) {
    return { ...cached, cached: true };
  }

  const stats = await analyticsModel.findPassengerStats(from, to);
  const summary = stats.reduce(
    (acc, row) => ({
      total_registered: acc.total_registered + row.total_registered,
      active_users: acc.active_users + row.active_users,
    }),
    { total_registered: 0, active_users: 0 }
  );

  const result = {
    from,
    to,
    summary,
    daily: stats,
    cached: false,
  };

  await setCached(key, result);
  return result;
}

async function getTicketAnalytics(query) {
  const { from, to } = defaultDateRange(query);
  const vehicleType = query.vehicle_type || null;
  const key = cacheKey('tickets', { from, to, vehicleType });
  const cached = await getCached(key);
  if (cached) {
    return { ...cached, cached: true };
  }

  const stats = await analyticsModel.findTicketStats(from, to, vehicleType);
  const summary = stats.reduce(
    (acc, row) => ({
      tickets_created: acc.tickets_created + row.tickets_created,
      tickets_cancelled: acc.tickets_cancelled + row.tickets_cancelled,
      total_revenue: acc.total_revenue + parseFloat(row.total_revenue),
    }),
    { tickets_created: 0, tickets_cancelled: 0, total_revenue: 0 }
  );
  summary.total_revenue = Math.round(summary.total_revenue * 100) / 100;

  const result = {
    from,
    to,
    vehicle_type: vehicleType,
    summary,
    daily: stats.map((row) => ({
      ...row,
      total_revenue: parseFloat(row.total_revenue),
    })),
    cached: false,
  };

  await setCached(key, result);
  return result;
}

async function getRouteAnalytics(query) {
  const { from, to } = defaultDateRange(query);
  const routeId = query.route_id || null;
  const key = cacheKey('routes', { from, to, routeId });
  const cached = await getCached(key);
  if (cached) {
    return { ...cached, cached: true };
  }

  const stats = await analyticsModel.findRouteUtilization(from, to, routeId);
  const summary = stats.reduce(
    (acc, row) => ({
      ticket_count: acc.ticket_count + row.ticket_count,
      gps_event_count: acc.gps_event_count + row.gps_event_count,
    }),
    { ticket_count: 0, gps_event_count: 0 }
  );

  const result = {
    from,
    to,
    route_id: routeId,
    summary,
    daily: stats.map((row) => ({
      ...row,
      avg_occupancy: parseFloat(row.avg_occupancy),
    })),
    cached: false,
  };

  await setCached(key, result);
  return result;
}

async function processEvent(eventType, timestamp, payload) {
  const statDate = toStatDate(timestamp);

  switch (eventType) {
    case 'passenger.registered':
      await analyticsModel.upsertPassengerRegistered(statDate);
      await invalidateCache('passengers');
      break;

    case 'passenger.login':
      await analyticsModel.upsertPassengerLogin(statDate);
      await invalidateCache('passengers');
      break;

    case 'ticket.created': {
      const vehicleType = payload.vehicle_type || 'bus';
      const fare = parseFloat(payload.fare) || 0;
      await analyticsModel.upsertTicketCreated(statDate, vehicleType, fare);
      await invalidateCache('tickets');

      const routeId = resolveRouteId(payload);
      if (routeId) {
        await analyticsModel.upsertRouteTicket(statDate, routeId);
        await invalidateCache('routes');
      }
      break;
    }

    case 'ticket.cancelled': {
      const vehicleType = payload.vehicle_type || 'bus';
      await analyticsModel.upsertTicketCancelled(statDate, vehicleType);
      await invalidateCache('tickets');
      break;
    }

    case 'gps.coordinate': {
      const routeId = resolveRouteId(payload);
      if (routeId) {
        await analyticsModel.upsertRouteGpsEvent(statDate, routeId);
        await invalidateCache('routes');
      }
      break;
    }

    case 'route.updated':
      break;

    default:
      logger.debug('Unhandled analytics event', { eventType });
  }
}

module.exports = {
  toStatDate,
  resolveRouteId,
  defaultDateRange,
  cacheKey,
  getPassengerAnalytics,
  getTicketAnalytics,
  getRouteAnalytics,
  processEvent,
  invalidateCache,
};
