'use strict';

const notificationService = require('../services/notificationService');

async function listNotifications(req, res, next) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
    const notifications = await notificationService.listForPassenger(req.user.id, { limit, offset });
    return res.json({ count: notifications.length, notifications });
  } catch (err) {
    return next(err);
  }
}

async function announce(req, res, next) {
  try {
    const { title, message, passengerId, routeId } = req.body;
    const notification = await notificationService.announce({
      title,
      message,
      passengerId: passengerId ?? null,
      routeId: routeId ?? null,
    });
    return res.status(201).json({ notification });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listNotifications,
  announce,
};
