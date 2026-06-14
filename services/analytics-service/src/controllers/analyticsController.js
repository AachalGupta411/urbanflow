'use strict';

const analyticsService = require('../services/analyticsService');

async function getPassengers(req, res, next) {
  try {
    const data = await analyticsService.getPassengerAnalytics(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getTickets(req, res, next) {
  try {
    const data = await analyticsService.getTicketAnalytics(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getRoutes(req, res, next) {
  try {
    const data = await analyticsService.getRouteAnalytics(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPassengers,
  getTickets,
  getRoutes,
};
