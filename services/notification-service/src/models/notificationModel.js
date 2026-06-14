'use strict';

const { getPool } = require('@urbanflow/shared/utils/db');

async function create({ passenger_id, type, title, message, route_id }) {
  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO notifications (passenger_id, type, title, message, route_id)
     VALUES (?, ?, ?, ?, ?)`,
    [passenger_id ?? null, type, title, message, route_id ?? null]
  );

  return findById(result.insertId);
}

async function findById(id) {
  const pool = getPool();
  const [rows] = await pool.execute('SELECT * FROM notifications WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findByPassengerId(passengerId, { limit = 50, offset = 0 } = {}) {
  const pool = getPool();
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const safeOffset = Math.max(Number(offset) || 0, 0);

  const [rows] = await pool.execute(
    `SELECT * FROM notifications
     WHERE passenger_id = ? OR passenger_id IS NULL
     ORDER BY created_at DESC
     LIMIT ${safeLimit} OFFSET ${safeOffset}`,
    [passengerId]
  );

  return rows;
}

module.exports = {
  create,
  findById,
  findByPassengerId,
};
