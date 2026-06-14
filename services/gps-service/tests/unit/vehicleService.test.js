'use strict';

jest.mock('@urbanflow/shared/utils/redis', () => ({
  getRedis: jest.fn(),
}));

jest.mock('../../src/models/coordinateModel', () => ({
  getLatestByVehicleId: jest.fn(),
  getTrackByVehicleId: jest.fn(),
}));

jest.mock('../../src/models/vehicleModel', () => ({
  findByVehicleId: jest.fn(),
}));

const { getRedis } = require('@urbanflow/shared/utils/redis');
const coordinateModel = require('../../src/models/coordinateModel');
const vehicleModel = require('../../src/models/vehicleModel');
const gpsService = require('../../src/services/gpsService');
const vehicleService = require('../../src/services/vehicleService');

describe('vehicleService', () => {
  const mockRedis = {
    status: 'ready',
    connect: jest.fn(),
    get: jest.fn(),
  };

  const vehicle = {
    vehicle_id: 'BUS-101',
    vehicle_type: 'bus',
    route_id: 'R-42',
    status: 'active',
    created_at: '2026-06-14T10:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getRedis.mockReturnValue(mockRedis);
  });

  describe('getVehicleWithPosition', () => {
    it('returns cached position when available', async () => {
      vehicleModel.findByVehicleId.mockResolvedValue(vehicle);
      mockRedis.get.mockResolvedValue(
        JSON.stringify({
          vehicleId: 'BUS-101',
          latitude: 40.7128,
          longitude: -74.006,
          speed: 20,
          heading: 90,
          recordedAt: '2026-06-14T12:00:00.000Z',
        })
      );

      const result = await vehicleService.getVehicleWithPosition('BUS-101');

      expect(result.vehicle.vehicleId).toBe('BUS-101');
      expect(result.position.latitude).toBe(40.7128);
      expect(coordinateModel.getLatestByVehicleId).not.toHaveBeenCalled();
    });

    it('falls back to database when cache misses', async () => {
      vehicleModel.findByVehicleId.mockResolvedValue(vehicle);
      mockRedis.get.mockResolvedValue(null);
      coordinateModel.getLatestByVehicleId.mockResolvedValue({
        vehicle_id: 'BUS-101',
        latitude: '40.70000000',
        longitude: '-74.00000000',
        speed: '15.00',
        heading: '45.00',
        recorded_at: '2026-06-14T11:00:00.000Z',
      });

      const result = await vehicleService.getVehicleWithPosition('BUS-101');

      expect(result.position).toEqual({
        vehicleId: 'BUS-101',
        latitude: 40.7,
        longitude: -74,
        speed: 15,
        heading: 45,
        recordedAt: '2026-06-14T11:00:00.000Z',
      });
    });

    it('throws 404 when vehicle is not found', async () => {
      vehicleModel.findByVehicleId.mockResolvedValue(null);

      await expect(vehicleService.getVehicleWithPosition('MISSING')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('getVehicleTrack', () => {
    it('returns historical coordinates', async () => {
      vehicleModel.findByVehicleId.mockResolvedValue(vehicle);
      coordinateModel.getTrackByVehicleId.mockResolvedValue([
        {
          id: 2,
          vehicle_id: 'BUS-101',
          latitude: '40.71280000',
          longitude: '-74.00600000',
          speed: '25.00',
          heading: '180.00',
          recorded_at: '2026-06-14T12:00:00.000Z',
        },
      ]);

      const result = await vehicleService.getVehicleTrack('BUS-101', { limit: 50 });

      expect(result.count).toBe(1);
      expect(result.track[0].latitude).toBe(40.7128);
    });
  });
});
