'use strict';

const passengerService = require('../services/passengerService');
const logger = require('../../../shared/utils/logger');

function handleServiceError(err, res) {
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  logger.error('Unhandled controller error', { error: err.message, stack: err.stack });
  return res.status(500).json({ error: 'Internal server error' });
}

async function register(req, res) {
  try {
    const { email, password, full_name: fullName, phone } = req.body;
    const result = await passengerService.register({ email, password, fullName, phone });
    return res.status(201).json(result);
  } catch (err) {
    return handleServiceError(err, res);
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await passengerService.login({ email, password });
    return res.json(result);
  } catch (err) {
    return handleServiceError(err, res);
  }
}

async function getProfile(req, res) {
  try {
    const passenger = await passengerService.getProfile(req.user.id);
    return res.json({ passenger });
  } catch (err) {
    return handleServiceError(err, res);
  }
}

async function updateProfile(req, res) {
  try {
    const { full_name: fullName, phone } = req.body;
    const passenger = await passengerService.updateProfile(req.user.id, { fullName, phone });
    return res.json({ passenger });
  } catch (err) {
    return handleServiceError(err, res);
  }
}

module.exports = { register, login, getProfile, updateProfile };
