'use strict';

jest.mock('../../src/models/notificationModel');

const notificationModel = require('../../src/models/notificationModel');
const notificationService = require('../../src/services/notificationService');

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listForPassenger', () => {
    it('returns mapped notifications for a passenger', async () => {
      notificationModel.findByPassengerId.mockResolvedValue([
        {
          id: 1,
          passenger_id: 42,
          type: 'system',
          title: 'Welcome',
          message: 'Hello',
          route_id: null,
          is_read: 0,
          created_at: '2026-06-14T12:00:00.000Z',
        },
      ]);

      const result = await notificationService.listForPassenger(42);

      expect(notificationModel.findByPassengerId).toHaveBeenCalledWith(42, { limit: 50, offset: 0 });
      expect(result).toEqual([
        {
          id: 1,
          passengerId: 42,
          type: 'system',
          title: 'Welcome',
          message: 'Hello',
          routeId: null,
          isRead: false,
          createdAt: '2026-06-14T12:00:00.000Z',
        },
      ]);
    });
  });

  describe('announce', () => {
    it('creates a system notification', async () => {
      notificationModel.create.mockResolvedValue({
        id: 2,
        passenger_id: null,
        type: 'system',
        title: 'Maintenance',
        message: 'Planned outage tonight',
        route_id: null,
        is_read: 0,
        created_at: '2026-06-14T13:00:00.000Z',
      });

      const result = await notificationService.announce({
        title: 'Maintenance',
        message: 'Planned outage tonight',
      });

      expect(notificationModel.create).toHaveBeenCalledWith({
        passenger_id: null,
        type: 'system',
        title: 'Maintenance',
        message: 'Planned outage tonight',
        route_id: null,
      });
      expect(result.title).toBe('Maintenance');
    });
  });

  describe('handleGpsEvent', () => {
    it('creates a delay notification when speed is zero', async () => {
      notificationModel.create.mockResolvedValue({
        id: 3,
        passenger_id: null,
        type: 'delay',
        title: 'Service Delay',
        message: 'Vehicle BUS-101 on route R-42 is stopped and may cause delays.',
        route_id: 'R-42',
        is_read: 0,
        created_at: '2026-06-14T14:00:00.000Z',
      });

      const result = await notificationService.handleGpsEvent('gps.coordinate', {
        vehicleId: 'BUS-101',
        routeId: 'R-42',
        speed: 0,
      });

      expect(result.type).toBe('delay');
      expect(result.routeId).toBe('R-42');
    });

    it('ignores moving vehicles', async () => {
      const result = await notificationService.handleGpsEvent('gps.coordinate', {
        vehicleId: 'BUS-101',
        routeId: 'R-42',
        speed: 15,
      });

      expect(result).toBeNull();
      expect(notificationModel.create).not.toHaveBeenCalled();
    });

    it('creates a route change notification', async () => {
      notificationModel.create.mockResolvedValue({
        id: 4,
        passenger_id: null,
        type: 'route_change',
        title: 'Route Updated',
        message: 'Route R-42 (Airport Express) has been updated. Check the latest schedule and stops.',
        route_id: 'R-42',
        is_read: 0,
        created_at: '2026-06-14T15:00:00.000Z',
      });

      const result = await notificationService.handleGpsEvent('route.updated', {
        routeId: 'R-42',
        name: 'Airport Express',
      });

      expect(result.type).toBe('route_change');
    });
  });

  describe('handleTicketEvent', () => {
    it('creates a ticket confirmation notification', async () => {
      notificationModel.create.mockResolvedValue({
        id: 5,
        passenger_id: 7,
        type: 'system',
        title: 'Ticket Confirmed',
        message: 'Your ticket abc-123 for route R-10 is confirmed.',
        route_id: 'R-10',
        is_read: 0,
        created_at: '2026-06-14T16:00:00.000Z',
      });

      const result = await notificationService.handleTicketEvent('ticket.created', {
        passenger_id: 7,
        ticket_code: 'abc-123',
        route_id: 'R-10',
      });

      expect(result.passengerId).toBe(7);
      expect(result.title).toBe('Ticket Confirmed');
    });

    it('creates a ticket cancellation notification', async () => {
      notificationModel.create.mockResolvedValue({
        id: 6,
        passenger_id: 7,
        type: 'system',
        title: 'Ticket Cancelled',
        message: 'Your ticket abc-123 has been cancelled.',
        route_id: 'R-10',
        is_read: 0,
        created_at: '2026-06-14T16:30:00.000Z',
      });

      const result = await notificationService.handleTicketEvent('ticket.cancelled', {
        passenger_id: 7,
        ticket_code: 'abc-123',
        route_id: 'R-10',
      });

      expect(result.title).toBe('Ticket Cancelled');
    });
  });

  describe('handleSystemEvent', () => {
    it('creates a system announcement notification', async () => {
      notificationModel.create.mockResolvedValue({
        id: 7,
        passenger_id: null,
        type: 'system',
        title: 'Holiday Schedule',
        message: 'Reduced service on Monday.',
        route_id: null,
        is_read: 0,
        created_at: '2026-06-14T17:00:00.000Z',
      });

      const result = await notificationService.handleSystemEvent('system.announcement', {
        title: 'Holiday Schedule',
        message: 'Reduced service on Monday.',
      });

      expect(result.title).toBe('Holiday Schedule');
    });
  });
});
