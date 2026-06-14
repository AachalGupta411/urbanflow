'use strict';

const { query } = require('../../../shared/utils/db');

function computeOccupancy(ticketCount, gpsEventCount) {
  const occupancy = ticketCount * 2 + gpsEventCount * 0.05;
  return Math.min(100, Math.round(occupancy * 100) / 100);
}

async function upsertPassengerRegistered(statDate) {
  await query(
    `INSERT INTO passenger_stats (stat_date, total_registered, active_users)
     VALUES (?, 1, 0)
     ON DUPLICATE KEY UPDATE total_registered = total_registered + 1`,
    [statDate]
  );
}

async function upsertPassengerLogin(statDate) {
  await query(
    `INSERT INTO passenger_stats (stat_date, total_registered, active_users)
     VALUES (?, 0, 1)
     ON DUPLICATE KEY UPDATE active_users = active_users + 1`,
    [statDate]
  );
}

async function upsertTicketCreated(statDate, vehicleType, fare) {
  await query(
    `INSERT INTO ticket_stats (stat_date, vehicle_type, tickets_created, total_revenue)
     VALUES (?, ?, 1, ?)
     ON DUPLICATE KEY UPDATE
       tickets_created = tickets_created + 1,
       total_revenue = total_revenue + VALUES(total_revenue)`,
    [statDate, vehicleType, fare]
  );
}

async function upsertTicketCancelled(statDate, vehicleType) {
  await query(
    `INSERT INTO ticket_stats (stat_date, vehicle_type, tickets_cancelled)
     VALUES (?, ?, 1)
     ON DUPLICATE KEY UPDATE tickets_cancelled = tickets_cancelled + 1`,
    [statDate, vehicleType]
  );
}

async function upsertRouteTicket(statDate, routeId) {
  await query(
    `INSERT INTO route_utilization (route_id, stat_date, ticket_count, gps_event_count, avg_occupancy)
     VALUES (?, ?, 1, 0, ?)
     ON DUPLICATE KEY UPDATE
       ticket_count = ticket_count + 1,
       avg_occupancy = LEAST(100, ROUND((ticket_count + 1) * 2 + gps_event_count * 0.05, 2))`,
    [routeId, statDate, computeOccupancy(1, 0)]
  );
}

async function upsertRouteGpsEvent(statDate, routeId) {
  await query(
    `INSERT INTO route_utilization (route_id, stat_date, ticket_count, gps_event_count, avg_occupancy)
     VALUES (?, ?, 0, 1, ?)
     ON DUPLICATE KEY UPDATE
       gps_event_count = gps_event_count + 1,
       avg_occupancy = LEAST(100, ROUND(ticket_count * 2 + (gps_event_count + 1) * 0.05, 2))`,
    [routeId, statDate, computeOccupancy(0, 1)]
  );
}

async function findPassengerStats(fromDate, toDate) {
  return query(
    `SELECT stat_date, total_registered, active_users, updated_at
     FROM passenger_stats
     WHERE stat_date BETWEEN ? AND ?
     ORDER BY stat_date ASC`,
    [fromDate, toDate]
  );
}

async function findTicketStats(fromDate, toDate, vehicleType) {
  const params = [fromDate, toDate];
  let sql = `
    SELECT stat_date, vehicle_type, tickets_created, tickets_cancelled, total_revenue
    FROM ticket_stats
    WHERE stat_date BETWEEN ? AND ?
  `;

  if (vehicleType) {
    sql += ' AND vehicle_type = ?';
    params.push(vehicleType);
  }

  sql += ' ORDER BY stat_date ASC, vehicle_type ASC';
  return query(sql, params);
}

async function findRouteUtilization(fromDate, toDate, routeId) {
  const params = [fromDate, toDate];
  let sql = `
    SELECT route_id, stat_date, ticket_count, gps_event_count, avg_occupancy
    FROM route_utilization
    WHERE stat_date BETWEEN ? AND ?
  `;

  if (routeId) {
    sql += ' AND route_id = ?';
    params.push(routeId);
  }

  sql += ' ORDER BY stat_date ASC, route_id ASC';
  return query(sql, params);
}

module.exports = {
  computeOccupancy,
  upsertPassengerRegistered,
  upsertPassengerLogin,
  upsertTicketCreated,
  upsertTicketCancelled,
  upsertRouteTicket,
  upsertRouteGpsEvent,
  findPassengerStats,
  findTicketStats,
  findRouteUtilization,
};
