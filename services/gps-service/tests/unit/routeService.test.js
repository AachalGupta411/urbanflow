'use strict';

jest.mock('@urbanflow/shared/utils/kafka', () => ({
  publishEvent: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/models/routeModel', () => ({
  update: jest.fn(),
}));

const { publishEvent } = require('@urbanflow/shared/utils/kafka');
const routeModel = require('../../src/models/routeModel');
const routeService = require('../../src/services/routeService');
const { EVENT_TYPES, KAFKA_TOPIC } = require('../../src/constants');

describe('routeService', () => {
  const mockProducer = { send: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    routeService.setProducer(mockProducer);
  });

  it('updates route and publishes route.updated event', async () => {
    const updatedRoute = {
      route_id: 'R-42',
      name: 'Downtown Express',
      origin: 'Central Station',
      destination: 'Airport Terminal',
      stops: [{ name: 'Stop A' }],
      updated_at: '2026-06-14T12:30:00.000Z',
    };
    routeModel.update.mockResolvedValue(updatedRoute);

    const result = await routeService.updateRoute('R-42', {
      name: 'Downtown Express',
    });

    expect(result.routeId).toBe('R-42');
    expect(publishEvent).toHaveBeenCalledWith(
      mockProducer,
      KAFKA_TOPIC,
      EVENT_TYPES.ROUTE_UPDATED,
      expect.objectContaining({
        routeId: 'R-42',
        name: 'Downtown Express',
      })
    );
  });

  it('throws 404 when route does not exist', async () => {
    routeModel.update.mockResolvedValue(null);

    await expect(routeService.updateRoute('UNKNOWN', { name: 'Test' })).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
