'use strict';

const { authenticate } = require('@urbanflow/shared/middleware/auth');

function authenticateAnnounce(req, res, next) {
  return authenticate(req, res, next);
}

function requireAdminOrDemo(_req, _res, next) {
  return next();
}

module.exports = {
  authenticate,
  authenticateAnnounce,
  requireAdminOrDemo,
};
