'use strict';

const { query } = require('@urbanflow/shared/utils/db');

async function insert({ vehicleId, latitude, longitude, speed = 0, heading = 0 }) {
  const result = await query(
    `INSERT INTO gps_coordinates (vehicle_id, latitude, longitude, speed, heading)
     VALUES (?, ?, ?, ?, ?)`,
    [vehicleId, latitude, longitude, speed, heading]
  );

  const rows = await query(
    `SELECT id, vehicle_id, latitude, longitude, speed, heading, recorded_at
     FROM gps_coordinates WHERE id = ?`,
    [result.insertId]
  );
  return rows[0];
}

async function getLatestByVehicleId(vehicleId) {
  const rows = await query(
    `SELECT id, vehicle_id, latitude, longitude, speed, heading, recorded_at
     FROM gps_coordinates
     WHERE vehicle_id = ?
     ORDER BY recorded_at DESC
     LIMIT 1`,
    [vehicleId]
  );
  return rows[0] || null;
}

async function getTrackByVehicleId(vehicleId, { limit = 20, from, to }) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 500);

  let sql = `
    SELECT id, vehicle_id, latitude, longitude, speed, heading, recorded_at
    FROM gps_coordinates
    WHERE vehicle_id = ?
  `;
  const params = [vehicleId];

  if (from) {
    sql += ' AND recorded_at >= ?';
    params.push(from);
  }
  if (to) {
    sql += ' AND recorded_at <= ?';
    params.push(to);
  }

  // LIMIT cannot use prepared-statement placeholders in MySQL — sanitize and inline
  sql += ` ORDER BY recorded_at DESC LIMIT ${safeLimit}`;

  return query(sql, params);
}

module.exports = { insert, getLatestByVehicleId, getTrackByVehicleId };
