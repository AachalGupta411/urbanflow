'use strict';

const { Router } = require('express');
const { body, query } = require('express-validator');
const validate = require('@urbanflow/shared/middleware/validator');
const {
  authenticate,
  authenticateAnnounce,
  requireAdminOrDemo,
} = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

const router = Router();

router.get(
  '/',
  authenticate,
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    validate,
  ],
  notificationController.listNotifications
);

router.post(
  '/announce',
  authenticateAnnounce,
  requireAdminOrDemo,
  [
    body('title').trim().notEmpty().isLength({ max: 255 }),
    body('message').trim().notEmpty(),
    body('passengerId').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
    body('routeId').optional({ nullable: true }).isString().trim().isLength({ max: 50 }),
    validate,
  ],
  notificationController.announce
);

module.exports = router;
