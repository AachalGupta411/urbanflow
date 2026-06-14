'use strict';

jest.mock('../../src/services/analyticsService', () => ({
  processEvent: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../shared/utils/kafka', () => ({
  createConsumer: jest.fn(),
}));

const analyticsService = require('../../src/services/analyticsService');
const { createConsumer } = require('../../../shared/utils/kafka');
const { handleMessage, startAnalyticsConsumer, TOPICS, EVENT_TYPES } = require('../../src/consumers/analyticsConsumer');

describe('analyticsConsumer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleMessage', () => {
    it('parses Kafka envelope and delegates to analyticsService.processEvent', async () => {
      const message = {
        value: Buffer.from(
          JSON.stringify({
            eventType: EVENT_TYPES.TICKET_CREATED,
            timestamp: '2026-06-14T10:00:00.000Z',
            payload: { id: 1, route_id: 'R-1', vehicle_type: 'bus', fare: 10 },
          })
        ),
      };

      await handleMessage(message);

      expect(analyticsService.processEvent).toHaveBeenCalledWith(
        EVENT_TYPES.TICKET_CREATED,
        '2026-06-14T10:00:00.000Z',
        expect.objectContaining({ route_id: 'R-1' })
      );
    });

    it('ignores messages with invalid JSON', async () => {
      await handleMessage({ value: Buffer.from('not-json') });
      expect(analyticsService.processEvent).not.toHaveBeenCalled();
    });

    it('ignores empty messages', async () => {
      await handleMessage({ value: null });
      expect(analyticsService.processEvent).not.toHaveBeenCalled();
    });

    it('ignores messages missing eventType or payload', async () => {
      await handleMessage({
        value: Buffer.from(JSON.stringify({ timestamp: '2026-06-14T10:00:00.000Z' })),
      });
      expect(analyticsService.processEvent).not.toHaveBeenCalled();
    });
  });

  describe('startAnalyticsConsumer', () => {
    it('connects, subscribes to event topics, and starts the consumer', async () => {
      const mockConsumer = {
        connect: jest.fn().mockResolvedValue(undefined),
        subscribe: jest.fn().mockResolvedValue(undefined),
        run: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn(),
      };
      createConsumer.mockReturnValue(mockConsumer);

      const consumer = await startAnalyticsConsumer();

      expect(createConsumer).toHaveBeenCalled();
      expect(mockConsumer.connect).toHaveBeenCalled();
      expect(mockConsumer.subscribe).toHaveBeenCalledWith({
        topics: [TOPICS.GPS, TOPICS.TICKET, TOPICS.PASSENGER],
        fromBeginning: false,
      });
      expect(mockConsumer.run).toHaveBeenCalled();
      expect(consumer).toBe(mockConsumer);
    });
  });
});
