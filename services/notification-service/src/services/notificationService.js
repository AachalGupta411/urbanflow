'use strict';

const notificationModel = require('../models/notificationModel');

function toPublicNotification(row) {
  return {
    id: row.id,
    passengerId: row.passenger_id,
    type: row.type,
    title: row.title,
    message: row.message,
    routeId: row.route_id,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
  };
}

async function listForPassenger(passengerId, { limit = 50, offset = 0 } = {}) {
  const rows = await notificationModel.findByPassengerId(passengerId, { limit, offset });
  return rows.map(toPublicNotification);
}

async function createNotification(data) {
  const row = await notificationModel.create(data);
  return toPublicNotification(row);
}

async function announce({ title, message, passengerId = null, routeId = null }) {
  return createNotification({
    passenger_id: passengerId,
    type: 'system',
    title,
    message,
    route_id: routeId,
  });
}

async function handleGpsEvent(eventType, payload) {
  if (eventType === 'gps.coordinate' && Number(payload.speed) === 0) {
    const routeId = payload.routeId || null;
    return createNotification({
      passenger_id: null,
      type: 'delay',
      title: 'Service Delay',
      message: `Vehicle ${payload.vehicleId} on route ${routeId || 'unknown'} is stopped and may cause delays.`,
      route_id: routeId,
    });
  }

  if (eventType === 'route.updated') {
    return createNotification({
      passenger_id: null,
      type: 'route_change',
      title: 'Route Updated',
      message: `Route ${payload.routeId} (${payload.name}) has been updated. Check the latest schedule and stops.`,
      route_id: payload.routeId,
    });
  }

  return null;
}

async function handleTicketEvent(eventType, payload) {
  const passengerId = payload.passenger_id || payload.passengerId || null;

  if (eventType === 'ticket.created') {
    return createNotification({
      passenger_id: passengerId,
      type: 'system',
      title: 'Ticket Confirmed',
      message: `Your ticket ${payload.ticket_code || payload.ticketCode} for route ${payload.route_id || payload.routeId} is confirmed.`,
      route_id: payload.route_id || payload.routeId || null,
    });
  }

  if (eventType === 'ticket.cancelled') {
    return createNotification({
      passenger_id: passengerId,
      type: 'system',
      title: 'Ticket Cancelled',
      message: `Your ticket ${payload.ticket_code || payload.ticketCode} has been cancelled.`,
      route_id: payload.route_id || payload.routeId || null,
    });
  }

  return null;
}

async function handleSystemEvent(eventType, payload) {
  if (eventType === 'system.announcement' || eventType.startsWith('system.')) {
    return createNotification({
      passenger_id: payload.passengerId || payload.passenger_id || null,
      type: 'system',
      title: payload.title || 'System Announcement',
      message: payload.message || payload.body || 'A system announcement was published.',
      route_id: payload.routeId || payload.route_id || null,
    });
  }

  return null;
}

module.exports = {
  listForPassenger,
  createNotification,
  announce,
  handleGpsEvent,
  handleTicketEvent,
  handleSystemEvent,
  toPublicNotification,
};
