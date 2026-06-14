'use strict';

const ticketService = require('../../src/services/ticketService');
const ticketModel = require('../../src/models/ticketModel');
const { publishEvent } = require('../../../shared/utils/kafka');
const { getRedis } = require('../../../shared/utils/redis');

jest.mock('../../src/models/ticketModel');
jest.mock('../../../shared/utils/kafka');
jest.mock('../../../shared/utils/redis');

describe('ticketService', () => {
  const mockProducer = { send: jest.fn() };

  const sampleTicket = {
    id: 1,
    passenger_id: 42,
    route_id: 'R-101',
    vehicle_type: 'bus',
    origin: 'Central Station',
    destination: 'Airport Terminal',
    fare: 12.5,
    status: 'active',
    ticket_code: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    travel_date: '2026-06-15',
    created_at: '2026-06-14T10:00:00.000Z',
    updated_at: '2026-06-14T10:00:00.000Z',
  };

  const mockRedis = {
    status: 'ready',
    connect: jest.fn().mockResolvedValue(undefined),
    get: jest.fn(),
    setex: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
  };

  beforeEach(() => {
    getRedis.mockReturnValue(mockRedis);
    publishEvent.mockResolvedValue(undefined);
    mockRedis.get.mockResolvedValue(null);
  });

  describe('createTicket', () => {
    it('creates a ticket and publishes ticket.created event', async () => {
      ticketModel.create.mockResolvedValue(sampleTicket);

      const result = await ticketService.createTicket(
        42,
        {
          route_id: 'R-101',
          vehicle_type: 'bus',
          origin: 'Central Station',
          destination: 'Airport Terminal',
          fare: 12.5,
          travel_date: '2026-06-15',
        },
        mockProducer
      );

      expect(ticketModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          passenger_id: 42,
          route_id: 'R-101',
          status: 'active',
          ticket_code: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          ),
        })
      );
      expect(publishEvent).toHaveBeenCalledWith(
        mockProducer,
        'ticket-events',
        'ticket.created',
        expect.objectContaining({ id: 1, ticket_code: sampleTicket.ticket_code })
      );
      expect(result.id).toBe(1);
      expect(result.ticket_code).toBe(sampleTicket.ticket_code);
    });
  });

  describe('validateTicket', () => {
    it('returns cached result when available', async () => {
      const cached = { valid: true, message: 'cached' };
      mockRedis.get.mockResolvedValue(JSON.stringify(cached));

      const result = await ticketService.validateTicket(sampleTicket.ticket_code);

      expect(result).toEqual(cached);
      expect(ticketModel.findByCode).not.toHaveBeenCalled();
    });

    it('returns not_found for unknown ticket codes', async () => {
      ticketModel.findByCode.mockResolvedValue(null);

      const result = await ticketService.validateTicket(sampleTicket.ticket_code);

      expect(result).toEqual({
        valid: false,
        reason: 'not_found',
        message: 'Ticket not found',
      });
      expect(mockRedis.setex).toHaveBeenCalled();
    });

    it('rejects cancelled tickets', async () => {
      ticketModel.findByCode.mockResolvedValue({ ...sampleTicket, status: 'cancelled' });

      const result = await ticketService.validateTicket(sampleTicket.ticket_code);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('cancelled');
    });

    it('rejects already used tickets', async () => {
      ticketModel.findByCode.mockResolvedValue({ ...sampleTicket, status: 'used' });

      const result = await ticketService.validateTicket(sampleTicket.ticket_code);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('already_used');
    });

    it('marks active tickets as used and returns valid result', async () => {
      const usedTicket = { ...sampleTicket, status: 'used' };
      ticketModel.findByCode.mockResolvedValue(sampleTicket);
      ticketModel.updateStatus.mockResolvedValue(usedTicket);

      const result = await ticketService.validateTicket(sampleTicket.ticket_code);

      expect(ticketModel.updateStatus).toHaveBeenCalledWith(1, 'used');
      expect(result.valid).toBe(true);
      expect(result.ticket.status).toBe('used');
      expect(mockRedis.del).toHaveBeenCalled();
    });
  });

  describe('cancelTicket', () => {
    it('cancels an active ticket and publishes ticket.cancelled', async () => {
      const cancelled = { ...sampleTicket, status: 'cancelled' };
      ticketModel.findById.mockResolvedValue(sampleTicket);
      ticketModel.updateStatus.mockResolvedValue(cancelled);

      const result = await ticketService.cancelTicket(42, 1, mockProducer);

      expect(result.status).toBe('cancelled');
      expect(publishEvent).toHaveBeenCalledWith(
        mockProducer,
        'ticket-events',
        'ticket.cancelled',
        expect.objectContaining({ id: 1, status: 'cancelled' })
      );
      expect(mockRedis.del).toHaveBeenCalled();
    });

    it('throws 404 when ticket does not exist', async () => {
      ticketModel.findById.mockResolvedValue(null);

      await expect(ticketService.cancelTicket(42, 999, mockProducer)).rejects.toMatchObject({
        message: 'Ticket not found',
        statusCode: 404,
      });
    });

    it('throws 403 when passenger does not own the ticket', async () => {
      ticketModel.findById.mockResolvedValue(sampleTicket);

      await expect(ticketService.cancelTicket(99, 1, mockProducer)).rejects.toMatchObject({
        message: 'Not authorized to cancel this ticket',
        statusCode: 403,
      });
    });

    it('throws 409 when ticket is already cancelled', async () => {
      ticketModel.findById.mockResolvedValue({ ...sampleTicket, status: 'cancelled' });

      await expect(ticketService.cancelTicket(42, 1, mockProducer)).rejects.toMatchObject({
        statusCode: 409,
      });
    });

    it('throws 409 when ticket has been used', async () => {
      ticketModel.findById.mockResolvedValue({ ...sampleTicket, status: 'used' });

      await expect(ticketService.cancelTicket(42, 1, mockProducer)).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  describe('listBookings', () => {
    it('returns all tickets for a passenger', async () => {
      ticketModel.findByPassengerId.mockResolvedValue([sampleTicket]);

      const result = await ticketService.listBookings(42);

      expect(ticketModel.findByPassengerId).toHaveBeenCalledWith(42);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });
});
