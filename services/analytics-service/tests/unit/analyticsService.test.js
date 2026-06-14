'use strict';

jest.mock('../../src/models/analyticsModel');
jest.mock('../../../shared/utils/redis', () => ({
  getRedis: jest.fn(),
}));

const analyticsModel = require('../../src/models/analyticsModel');
const { getRedis } = require('../../../shared/utils/redis');
const analyticsService = require('../../src/services/analyticsService');

describe('analyticsService', () => {
  const mockRedis = {
    status: 'ready',
    connect: jest.fn().mockResolvedValue(undefined),
    get: jest.fn(),
    setex: jest.fn().mockResolvedValue('OK'),
    scan: jest.fn().mockResolvedValue(['0', []]),
    del: jest.fn().mockResolvedValue(1),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getRedis.mockReturnValue(mockRedis);
    mockRedis.get.mockResolvedValue(null);
  });

  describe('toStatDate', () => {
    it('extracts YYYY-MM-DD from ISO timestamp', () => {
      expect(analyticsService.toStatDate('2026-06-14T10:30:00.000Z')).toBe('2026-06-14');
    });

    it('uses today when timestamp is missing', () => {
      const today = new Date().toISOString().slice(0, 10);
      expect(analyticsService.toStatDate()).toBe(today);
    });
  });

  describe('resolveRouteId', () => {
    it('prefers route_id over routeId', () => {
      expect(analyticsService.resolveRouteId({ route_id: 'R-1', routeId: 'R-2' })).toBe('R-1');
    });

    it('falls back to routeId', () => {
      expect(analyticsService.resolveRouteId({ routeId: 'R-99' })).toBe('R-99');
    });
  });

  describe('getPassengerAnalytics', () => {
    it('returns aggregated passenger stats and caches the response', async () => {
      analyticsModel.findPassengerStats.mockResolvedValue([
        { stat_date: '2026-06-13', total_registered: 5, active_users: 3 },
        { stat_date: '2026-06-14', total_registered: 2, active_users: 1 },
      ]);

      const result = await analyticsService.getPassengerAnalytics({
        from: '2026-06-13',
        to: '2026-06-14',
      });

      expect(result.summary).toEqual({ total_registered: 7, active_users: 4 });
      expect(result.daily).toHaveLength(2);
      expect(result.cached).toBe(false);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringContaining('analytics:passengers:'),
        3600,
        expect.any(String)
      );
    });

    it('returns cached response when available', async () => {
      const cachedPayload = {
        from: '2026-06-13',
        to: '2026-06-14',
        summary: { total_registered: 7, active_users: 4 },
        daily: [],
        cached: false,
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedPayload));

      const result = await analyticsService.getPassengerAnalytics({
        from: '2026-06-13',
        to: '2026-06-14',
      });

      expect(result.cached).toBe(true);
      expect(analyticsModel.findPassengerStats).not.toHaveBeenCalled();
    });
  });

  describe('getTicketAnalytics', () => {
    it('aggregates ticket stats with revenue totals', async () => {
      analyticsModel.findTicketStats.mockResolvedValue([
        {
          stat_date: '2026-06-14',
          vehicle_type: 'bus',
          tickets_created: 3,
          tickets_cancelled: 1,
          total_revenue: '30.00',
        },
      ]);

      const result = await analyticsService.getTicketAnalytics({ from: '2026-06-14', to: '2026-06-14' });

      expect(result.summary).toEqual({
        tickets_created: 3,
        tickets_cancelled: 1,
        total_revenue: 30,
      });
      expect(result.daily[0].total_revenue).toBe(30);
    });
  });

  describe('processEvent', () => {
    it('handles ticket.created and updates route utilization', async () => {
      await analyticsService.processEvent('ticket.created', '2026-06-14T12:00:00.000Z', {
        route_id: 'R-101',
        vehicle_type: 'bus',
        fare: 12.5,
      });

      expect(analyticsModel.upsertTicketCreated).toHaveBeenCalledWith('2026-06-14', 'bus', 12.5);
      expect(analyticsModel.upsertRouteTicket).toHaveBeenCalledWith('2026-06-14', 'R-101');
    });

    it('handles gps.coordinate events with routeId', async () => {
      await analyticsService.processEvent('gps.coordinate', '2026-06-14T12:00:00.000Z', {
        routeId: 'R-202',
        vehicleId: 'V-1',
      });

      expect(analyticsModel.upsertRouteGpsEvent).toHaveBeenCalledWith('2026-06-14', 'R-202');
    });

    it('handles passenger.registered events', async () => {
      await analyticsService.processEvent('passenger.registered', '2026-06-14T08:00:00.000Z', {
        id: 1,
        email: 'user@example.com',
      });

      expect(analyticsModel.upsertPassengerRegistered).toHaveBeenCalledWith('2026-06-14');
    });

    it('handles ticket.cancelled events', async () => {
      await analyticsService.processEvent('ticket.cancelled', '2026-06-14T15:00:00.000Z', {
        vehicle_type: 'metro',
      });

      expect(analyticsModel.upsertTicketCancelled).toHaveBeenCalledWith('2026-06-14', 'metro');
    });
  });
});
