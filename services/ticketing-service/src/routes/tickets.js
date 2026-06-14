'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const { authenticate } = require('../../../shared/middleware/auth');
const validate = require('../../../shared/middleware/validator');
const ticketController = require('../controllers/ticketController');

const router = Router();

const vehicleTypes = ['bus', 'metro', 'ev'];

const createValidators = [
  body('route_id')
    .trim()
    .notEmpty()
    .withMessage('route_id is required')
    .isLength({ max: 50 })
    .withMessage('route_id must be at most 50 characters'),
  body('vehicle_type')
    .optional()
    .isIn(vehicleTypes)
    .withMessage(`vehicle_type must be one of: ${vehicleTypes.join(', ')}`),
  body('origin')
    .trim()
    .notEmpty()
    .withMessage('origin is required')
    .isLength({ max: 255 })
    .withMessage('origin must be at most 255 characters'),
  body('destination')
    .trim()
    .notEmpty()
    .withMessage('destination is required')
    .isLength({ max: 255 })
    .withMessage('destination must be at most 255 characters'),
  body('fare')
    .isFloat({ min: 0.01 })
    .withMessage('fare must be a positive number'),
  body('travel_date')
    .isISO8601({ strict: true })
    .withMessage('travel_date must be a valid ISO 8601 date (YYYY-MM-DD)'),
  validate,
];

const validateValidators = [
  body('ticket_code')
    .trim()
    .notEmpty()
    .withMessage('ticket_code is required')
    .isUUID()
    .withMessage('ticket_code must be a valid UUID'),
  validate,
];

const cancelValidators = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('id must be a positive integer'),
  validate,
];

router.post('/', authenticate, createValidators, ticketController.createTicket);
router.post('/validate', validateValidators, ticketController.validateTicket);
router.delete('/:id', authenticate, cancelValidators, ticketController.cancelTicket);
router.get('/', authenticate, ticketController.listBookings);

module.exports = router;
