'use strict';

jest.mock('@urbanflow/shared/utils/redis', () => ({
  getRedis: jest.fn(),
}));

jest.mock('@urbanflow/shared/utils/kafka', () => ({
  publishEvent: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/models/coordinateModel', () => ({
  insert: jest.fn(),
}));

jest.mock('../../src/models/vehicleModel', () => ({
  findByVehicleId: jest.fn(),
}));

const { getRedis } = require('@urbanflow/shared/utils/redis');
const { publishEvent } = require('@urbanflow/shared/utils/kafka');
const coordinateModel = require('../../src/models/coordinateModel');
const vehicleModel = require('../../src/models/vehicleModel');
const gpsService = require('../../src/services/gpsService');
const { EVENT_TYPES, KAFKA_TOPIC } = require('../../src/constants');

describe('gpsService', () => {
  const mockRedis = {
    status: 'ready',
    connect: jest.fn(),
    setex: jest.fn().mockResolvedValue('OK'),
  };

  const mockProducer = { send: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    getRedis.mockReturnValue(mockRedis);
    gpsService.setProducer(mockProducer);
  });

  describe('recordCoordinate', () => {
    const vehicle = {
      vehicle_id: 'BUS-101',
      vehicle_type: 'bus',
      route_id: 'R-42',
      status: 'active',
    };

    const coordinate = {
      id: 1,
      vehicle_id: 'BUS-101',
      latitude: '40.71280000',
      longitude: '-74.00600000',
      speed: '25.50',
      heading: '180.00',
      recorded_at: '2026-06-14T12:00:00.000Z',
    };

    it('stores coordinate, caches position, and publishes Kafka event', async () => {
      vehicleModel.findByVehicleId.mockResolvedValue(vehicle);
      coordinateModel.insert.mockResolvedValue(coordinate);

      const result = await gpsService.recordCoordinate({
        vehicleId: 'BUS-101',
        latitude: 40.7128,
        longitude: -74.006,
        speed: 25.5,
        heading: 180,
      });

      expect(result.coordinate).toEqual(coordinate);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'gps:vehicle:BUS-101',
        30,
        expect.stringContaining('"vehicleId":"BUS-101"')
      );
      expect(publishEvent).toHaveBeenCalledWith(
        mockProducer,
        KAFKA_TOPIC,
        EVENT_TYPES.COORDINATE,
        expect.objectContaining({
          vehicleId: 'BUS-101',
          latitude: 40.7128,
          longitude: -74.006,
          routeId: 'R-42',
        })
      );
    });

    it('throws 404 when vehicle does not exist', async () => {
      vehicleModel.findByVehicleId.mockResolvedValue(null);

      await expect(
        gpsService.recordCoordinate({
          vehicleId: 'UNKNOWN',
          latitude: 40.7128,
          longitude: -74.006,
        })
      ).rejects.toMatchObject({ message: 'Vehicle not found', statusCode: 404 });
    });
  });

  describe('getCachedPosition', () => {
    it('returns parsed cached position', async () => {
      const position = {
        vehicleId: 'BUS-101',
        latitude: 40.7128,
        longitude: -74.006,
      };
      mockRedis.get = jest.fn().mockResolvedValue(JSON.stringify(position));

      const result = await gpsService.getCachedPosition('BUS-101');

      expect(result).toEqual(position);
    });

    it('returns null when cache is empty', async () => {
      mockRedis.get = jest.fn().mockResolvedValue(null);

      const result = await gpsService.getCachedPosition('BUS-101');

      expect(result).toBeNull();
    });
  });
});
