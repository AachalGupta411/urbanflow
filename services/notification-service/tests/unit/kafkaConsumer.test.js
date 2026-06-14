'use strict';

jest.mock('@urbanflow/shared/utils/kafka', () => ({
  createConsumer: jest.fn(),
}));

jest.mock('@urbanflow/shared/utils/redis', () => ({
  getRedis: jest.fn(),
}));

jest.mock('../../src/services/notificationService', () => ({
  handleGpsEvent: jest.fn(),
  handleTicketEvent: jest.fn(),
  handleSystemEvent: jest.fn(),
}));

const { getRedis } = require('@urbanflow/shared/utils/redis');
const notificationService = require('../../src/services/notificationService');
const { handleEvent, buildDedupKey, isDuplicate } = require('../../src/consumers/kafkaConsumer');
const { TOPICS } = require('../../src/constants');

describe('kafkaConsumer', () => {
  const mockRedis = {
    status: 'ready',
    connect: jest.fn(),
    get: jest.fn(),
    setex: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getRedis.mockReturnValue(mockRedis);
    mockRedis.get.mockResolvedValue(null);
    mockRedis.setex.mockResolvedValue('OK');
  });

  describe('buildDedupKey', () => {
    it('builds a stable dedup key from event metadata', () => {
      const key = buildDedupKey(TOPICS.GPS, 'gps.coordinate', {
        id: 99,
        vehicleId: 'BUS-101',
        routeId: 'R-42',
      });

      expect(key).toBe('notification:dedup:gps-events:gps.coordinate:99:BUS-101:R-42');
    });
  });

  describe('isDuplicate', () => {
    it('returns true when dedup key already exists', async () => {
      mockRedis.get.mockResolvedValue('1');

      const duplicate = await isDuplicate('notification:dedup:test');

      expect(duplicate).toBe(true);
      expect(mockRedis.setex).not.toHaveBeenCalled();
    });

    it('stores dedup key for new events', async () => {
      const duplicate = await isDuplicate('notification:dedup:test');

      expect(duplicate).toBe(false);
      expect(mockRedis.setex).toHaveBeenCalledWith('notification:dedup:test', 300, '1');
    });
  });

  describe('handleEvent', () => {
    it('routes gps delay events to notificationService', async () => {
      notificationService.handleGpsEvent.mockResolvedValue({ id: 1, type: 'delay' });

      const result = await handleEvent(TOPICS.GPS, {
        eventType: 'gps.coordinate',
        payload: { vehicleId: 'BUS-101', routeId: 'R-42', speed: 0 },
      });

      expect(notificationService.handleGpsEvent).toHaveBeenCalledWith(
        'gps.coordinate',
        { vehicleId: 'BUS-101', routeId: 'R-42', speed: 0 }
      );
      expect(result).toEqual({ id: 1, type: 'delay' });
    });

    it('routes ticket events to notificationService', async () => {
      notificationService.handleTicketEvent.mockResolvedValue({ id: 2, type: 'system' });

      const result = await handleEvent(TOPICS.TICKET, {
        eventType: 'ticket.created',
        payload: { passenger_id: 5, ticket_code: 't-1', route_id: 'R-1' },
      });

      expect(notificationService.handleTicketEvent).toHaveBeenCalled();
      expect(result.id).toBe(2);
    });

    it('routes system events to notificationService', async () => {
      notificationService.handleSystemEvent.mockResolvedValue({ id: 3, type: 'system' });

      const result = await handleEvent(TOPICS.SYSTEM, {
        eventType: 'system.announcement',
        payload: { title: 'Alert', message: 'Test' },
      });

      expect(notificationService.handleSystemEvent).toHaveBeenCalled();
      expect(result.id).toBe(3);
    });

    it('skips duplicate events', async () => {
      mockRedis.get.mockResolvedValue('1');

      const result = await handleEvent(TOPICS.GPS, {
        eventType: 'gps.coordinate',
        payload: { vehicleId: 'BUS-101', routeId: 'R-42', speed: 0 },
      });

      expect(result).toBeNull();
      expect(notificationService.handleGpsEvent).not.toHaveBeenCalled();
    });

    it('returns null when eventType is missing', async () => {
      const result = await handleEvent(TOPICS.GPS, { payload: {} });

      expect(result).toBeNull();
    });
  });
});
