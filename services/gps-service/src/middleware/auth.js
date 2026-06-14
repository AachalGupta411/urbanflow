'use strict';

const { authenticate } = require('@urbanflow/shared/middleware/auth');
const serviceConfig = require('../config');

function authenticateApiKeyOrJwt(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (apiKey) {
    if (apiKey === serviceConfig.apiKey) {
      req.authType = 'api-key';
      return next();
    }
    return res.status(401).json({ error: 'Invalid API key' });
  }

  return authenticate(req, res, next);
}

module.exports = { authenticate, authenticateApiKeyOrJwt };
