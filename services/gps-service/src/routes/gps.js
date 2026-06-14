'use strict';

const { body, param, query } = require('express-validator');
const validate = require('@urbanflow/shared/middleware/validator');
const { authenticate, authenticateApiKeyOrJwt } = require('../middleware/auth');
const coordinateController = require('../controllers/coordinateController');
const vehicleController = require('../controllers/vehicleController');
const routeController = require('../controllers/routeController');

const router = require('express').Router();

const coordinateRules = [
  body('vehicleId').trim().notEmpty().withMessage('vehicleId is required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('latitude must be between -90 and 90'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('longitude must be between -180 and 180'),
  body('speed').optional().isFloat({ min: 0 }).withMessage('speed must be a non-negative number'),
  body('heading').optional().isFloat({ min: 0, max: 360 }).withMessage('heading must be between 0 and 360'),
];

const routeUpdateRules = [
  param('id').trim().notEmpty().withMessage('route id is required'),
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
  body('origin').optional().trim().notEmpty().withMessage('origin cannot be empty'),
  body('destination').optional().trim().notEmpty().withMessage('destination cannot be empty'),
  body('stops').optional().isArray().withMessage('stops must be an array'),
];

const trackQueryRules = [
  param('id').trim().notEmpty().withMessage('vehicle id is required'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('limit must be between 1 and 1000'),
  query('from').optional().isISO8601().withMessage('from must be a valid ISO8601 date'),
  query('to').optional().isISO8601().withMessage('to must be a valid ISO8601 date'),
];

router.post('/coordinates', authenticateApiKeyOrJwt, coordinateRules, validate, coordinateController.postCoordinates);
router.get('/vehicles/:id', param('id').trim().notEmpty(), validate, vehicleController.getVehicle);
router.get('/vehicles/:id/track', trackQueryRules, validate, vehicleController.getVehicleTrack);
router.put('/routes/:id', authenticate, routeUpdateRules, validate, routeController.updateRoute);

module.exports = router;
