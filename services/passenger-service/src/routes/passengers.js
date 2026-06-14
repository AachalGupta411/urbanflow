'use strict';

const express = require('express');
const { body } = require('express-validator');
const validate = require('../../../shared/middleware/validator');
const { authenticate } = require('../../../shared/middleware/auth');
const controller = require('../controllers/passengerController');

const router = express.Router();

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone must be 20 characters or fewer'),
  validate,
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const profileUpdateValidation = [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone must be 20 characters or fewer'),
  validate,
];

router.post('/register', registerValidation, controller.register);
router.post('/login', loginValidation, controller.login);
router.get('/profile', authenticate, controller.getProfile);
router.put('/profile', authenticate, profileUpdateValidation, controller.updateProfile);

module.exports = router;
