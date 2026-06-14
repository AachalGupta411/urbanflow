'use strict';

const vehicleService = require('../services/vehicleService');
const serviceConfig = require('../config');

async function getVehicle(req, res, next) {
  try {
    const result = await vehicleService.getVehicleWithPosition(req.params.id);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

async function getVehicleTrack(req, res, next) {
  try {
    const limit = Math.min(
      parseInt(req.query.limit || String(serviceConfig.defaultTrackLimit), 10),
      serviceConfig.maxTrackLimit
    );

    const result = await vehicleService.getVehicleTrack(req.params.id, {
      limit: Number.isNaN(limit) ? serviceConfig.defaultTrackLimit : limit,
      from: req.query.from || null,
      to: req.query.to || null,
    });

    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getVehicle, getVehicleTrack };
