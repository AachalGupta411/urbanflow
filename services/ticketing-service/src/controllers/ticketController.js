'use strict';

const ticketService = require('../services/ticketService');

function getPassengerId(req) {
  return req.user?.id ?? req.user?.passenger_id;
}

async function createTicket(req, res, next) {
  try {
    const passengerId = getPassengerId(req);
    const ticket = await ticketService.createTicket(
      passengerId,
      req.body,
      req.app.locals.kafkaProducer
    );
    res.status(201).json({ ticket });
  } catch (err) {
    next(err);
  }
}

async function validateTicket(req, res, next) {
  try {
    const result = await ticketService.validateTicket(req.body.ticket_code);
    const statusCode = result.valid ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (err) {
    next(err);
  }
}

async function cancelTicket(req, res, next) {
  try {
    const passengerId = getPassengerId(req);
    const ticket = await ticketService.cancelTicket(
      passengerId,
      parseInt(req.params.id, 10),
      req.app.locals.kafkaProducer
    );
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}

async function listBookings(req, res, next) {
  try {
    const passengerId = getPassengerId(req);
    const tickets = await ticketService.listBookings(passengerId);
    res.json({ tickets, count: tickets.length });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTicket,
  validateTicket,
  cancelTicket,
  listBookings,
};
