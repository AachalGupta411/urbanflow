'use strict';

const vehicleModel = require('../models/vehicleModel');
const coordinateModel = require('../models/coordinateModel');
const gpsService = require('./gpsService');

async function getVehicleWithPosition(vehicleId) {
  const vehicle = await vehicleModel.findByVehicleId(vehicleId);
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  let position = await gpsService.getCachedPosition(vehicleId);
  if (!position) {
    const latest = await coordinateModel.getLatestByVehicleId(vehicleId);
    if (latest) {
      position = {
        vehicleId: latest.vehicle_id,
        latitude: Number(latest.latitude),
        longitude: Number(latest.longitude),
        speed: Number(latest.speed),
        heading: Number(latest.heading),
        recordedAt: latest.recorded_at,
      };
    }
  }

  return {
    vehicle: {
      vehicleId: vehicle.vehicle_id,
      vehicleType: vehicle.vehicle_type,
      routeId: vehicle.route_id,
      status: vehicle.status,
      createdAt: vehicle.created_at,
    },
    position,
  };
}

async function getVehicleTrack(vehicleId, options) {
  const vehicle = await vehicleModel.findByVehicleId(vehicleId);
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  const coordinates = await coordinateModel.getTrackByVehicleId(vehicleId, options);

  return {
    vehicleId,
    count: coordinates.length,
    track: coordinates.map((row) => ({
      id: row.id,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      speed: Number(row.speed),
      heading: Number(row.heading),
      recordedAt: row.recorded_at,
    })),
  };
}

module.exports = { getVehicleWithPosition, getVehicleTrack };
