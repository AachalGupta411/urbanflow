'use strict';

const routeService = require('../services/routeService');

async function updateRoute(req, res, next) {
  try {
    const route = await routeService.updateRoute(req.params.id, req.body);
    return res.json({
      message: 'Route updated',
      route,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { updateRoute };
