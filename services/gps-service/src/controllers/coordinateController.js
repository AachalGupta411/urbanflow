'use strict';

const gpsService = require('../services/gpsService');

async function postCoordinates(req, res, next) {
  try {
    const { vehicleId, latitude, longitude, speed, heading } = req.body;
    const result = await gpsService.recordCoordinate({
      vehicleId,
      latitude,
      longitude,
      speed,
      heading,
    });

    return res.status(201).json({
      message: 'Coordinate recorded',
      coordinate: {
        id: result.coordinate.id,
        vehicleId: result.coordinate.vehicle_id,
        latitude: Number(result.coordinate.latitude),
        longitude: Number(result.coordinate.longitude),
        speed: Number(result.coordinate.speed),
        heading: Number(result.coordinate.heading),
        recordedAt: result.coordinate.recorded_at,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { postCoordinates };
