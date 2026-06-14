'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../../shared/config');

/**
 * Optional JWT authentication for demo read endpoints.
 * Valid tokens attach req.user; missing or invalid tokens still proceed.
 */
function optionalAuthenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }

  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, config.jwt.secret);
  } catch {
    // Public read — ignore invalid tokens
  }
  return next();
}

module.exports = { optionalAuthenticate };
