'use strict';

const { query } = require('@urbanflow/shared/utils/db');

async function findByRouteId(routeId) {
  const rows = await query(
    'SELECT id, route_id, name, origin, destination, stops, updated_at FROM routes WHERE route_id = ? LIMIT 1',
    [routeId]
  );
  if (!rows[0]) return null;

  const route = rows[0];
  if (typeof route.stops === 'string') {
    try {
      route.stops = JSON.parse(route.stops);
    } catch {
      route.stops = [];
    }
  }
  return route;
}

async function create({ routeId, name, origin, destination, stops = [] }) {
  await query(
    'INSERT INTO routes (route_id, name, origin, destination, stops) VALUES (?, ?, ?, ?, ?)',
    [routeId, name, origin, destination, JSON.stringify(stops)]
  );
  return findByRouteId(routeId);
}

async function update(routeId, { name, origin, destination, stops }) {
  const existing = await findByRouteId(routeId);
  if (!existing) return null;

  const updated = {
    name: name ?? existing.name,
    origin: origin ?? existing.origin,
    destination: destination ?? existing.destination,
    stops: stops ?? existing.stops ?? [],
  };

  await query(
    'UPDATE routes SET name = ?, origin = ?, destination = ?, stops = ? WHERE route_id = ?',
    [
      updated.name,
      updated.origin,
      updated.destination,
      JSON.stringify(updated.stops),
      routeId,
    ]
  );

  return findByRouteId(routeId);
}

module.exports = { findByRouteId, create, update };
