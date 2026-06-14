'use strict';

const { query } = require('../../../shared/utils/db');

const TICKET_COLUMNS = `
  id, passenger_id, route_id, vehicle_type, origin, destination,
  fare, status, ticket_code, travel_date, created_at, updated_at
`;

function mapRow(row) {
  if (!row) return null;
  return {
    ...row,
    fare: parseFloat(row.fare),
  };
}

async function findById(id) {
  const rows = await query(
    `SELECT ${TICKET_COLUMNS} FROM tickets WHERE id = ?`,
    [id]
  );
  return mapRow(rows[0]);
}

async function findByCode(ticketCode) {
  const rows = await query(
    `SELECT ${TICKET_COLUMNS} FROM tickets WHERE ticket_code = ?`,
    [ticketCode]
  );
  return mapRow(rows[0]);
}

async function findByPassengerId(passengerId) {
  const rows = await query(
    `SELECT ${TICKET_COLUMNS} FROM tickets WHERE passenger_id = ? ORDER BY created_at DESC`,
    [passengerId]
  );
  return rows.map(mapRow);
}

async function create(ticket) {
  const result = await query(
    `INSERT INTO tickets (
      passenger_id, route_id, vehicle_type, origin, destination,
      fare, status, ticket_code, travel_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ticket.passenger_id,
      ticket.route_id,
      ticket.vehicle_type,
      ticket.origin,
      ticket.destination,
      ticket.fare,
      ticket.status,
      ticket.ticket_code,
      ticket.travel_date,
    ]
  );
  return findById(result.insertId);
}

async function updateStatus(id, status) {
  await query(
    'UPDATE tickets SET status = ? WHERE id = ?',
    [status, id]
  );
  return findById(id);
}

module.exports = {
  findById,
  findByCode,
  findByPassengerId,
  create,
  updateStatus,
};
