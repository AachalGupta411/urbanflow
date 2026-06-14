'use strict';

const { Router } = require('express');
const { query } = require('express-validator');
const validate = require('../../../shared/middleware/validator');
const { optionalAuthenticate } = require('../middleware/optionalAuth');
const analyticsController = require('../controllers/analyticsController');

const router = Router();

const dateRangeValidators = [
  query('from')
    .optional()
    .isISO8601({ strict: true })
    .withMessage('from must be a valid ISO 8601 date (YYYY-MM-DD)'),
  query('to')
    .optional()
    .isISO8601({ strict: true })
    .withMessage('to must be a valid ISO 8601 date (YYYY-MM-DD)'),
  validate,
];

const ticketValidators = [
  ...dateRangeValidators.slice(0, -1),
  query('vehicle_type')
    .optional()
    .isIn(['bus', 'metro', 'ev'])
    .withMessage('vehicle_type must be one of: bus, metro, ev'),
  validate,
];

const routeValidators = [
  ...dateRangeValidators.slice(0, -1),
  query('route_id')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('route_id must be at most 50 characters'),
  validate,
];

router.use(optionalAuthenticate);

router.get('/passengers', dateRangeValidators, analyticsController.getPassengers);
router.get('/tickets', ticketValidators, analyticsController.getTickets);
router.get('/routes', routeValidators, analyticsController.getRoutes);

module.exports = router;
