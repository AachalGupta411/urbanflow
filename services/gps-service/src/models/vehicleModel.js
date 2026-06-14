'use strict';

const { query } = require('@urbanflow/shared/utils/db');

async function findByVehicleId(vehicleId) {
  const rows = await query(
    'SELECT id, vehicle_id, vehicle_type, route_id, status, created_at FROM vehicles WHERE vehicle_id = ? LIMIT 1',
    [vehicleId]
  );
  return rows[0] || null;
}

async function create({ vehicleId, vehicleType, routeId, status = 'active' }) {
  const result = await query(
    'INSERT INTO vehicles (vehicle_id, vehicle_type, route_id, status) VALUES (?, ?, ?, ?)',
    [vehicleId, vehicleType, routeId || null, status]
  );
  return findByVehicleId(vehicleId);
}

module.exports = { findByVehicleId, create };
