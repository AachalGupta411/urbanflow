import { ticketingClient } from './api';
import type { CreateTicketPayload, Ticket } from '@/types';

export async function listTickets(): Promise<Ticket[]> {
  const { data } = await ticketingClient.get<{ tickets: Ticket[]; count: number }>('/api/tickets');
  return data.tickets;
}

export async function createTicket(payload: CreateTicketPayload): Promise<Ticket> {
  const { data } = await ticketingClient.post<{ ticket: Ticket }>('/api/tickets', payload);
  return data.ticket;
}

export async function cancelTicket(id: number): Promise<Ticket> {
  const { data } = await ticketingClient.delete<{ ticket: Ticket }>(`/api/tickets/${id}`);
  return data.ticket;
}

export async function validateTicket(ticketCode: string): Promise<{ valid: boolean; ticket?: Ticket; message?: string }> {
  const { data } = await ticketingClient.post<{ valid: boolean; ticket?: Ticket; message?: string }>(
    '/api/tickets/validate',
    { ticket_code: ticketCode }
  );
  return data;
}
