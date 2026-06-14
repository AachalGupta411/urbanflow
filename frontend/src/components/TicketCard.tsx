import type { Ticket } from '@/types';
import { formatCurrency, formatDate } from '@/utils/token';

interface TicketCardProps {
  ticket: Ticket;
  onCancel?: (id: number) => void;
  cancelling?: boolean;
}

const statusClass: Record<Ticket['status'], string> = {
  active: 'badge-success',
  cancelled: 'badge-muted',
  used: 'badge-info',
  expired: 'badge-warning',
};

export default function TicketCard({ ticket, onCancel, cancelling }: TicketCardProps) {
  const canCancel = ticket.status === 'active' && onCancel;

  return (
    <article className="ticket-card">
      <header className="ticket-card-header">
        <div>
          <h3>{ticket.origin} → {ticket.destination}</h3>
          <p className="text-muted">Route {ticket.route_id} · {ticket.vehicle_type.toUpperCase()}</p>
        </div>
        <span className={`badge ${statusClass[ticket.status]}`}>{ticket.status}</span>
      </header>

      <dl className="ticket-meta">
        <div>
          <dt>Travel date</dt>
          <dd>{formatDate(ticket.travel_date)}</dd>
        </div>
        <div>
          <dt>Fare</dt>
          <dd>{formatCurrency(ticket.fare)}</dd>
        </div>
        <div>
          <dt>Ticket code</dt>
          <dd className="mono">{ticket.ticket_code}</dd>
        </div>
      </dl>

      {canCancel ? (
        <footer className="ticket-card-footer">
          <button
            type="button"
            className="btn btn-danger btn-sm"
            disabled={cancelling}
            onClick={() => onCancel(ticket.id)}
          >
            {cancelling ? 'Cancelling...' : 'Cancel ticket'}
          </button>
        </footer>
      ) : null}
    </article>
  );
}
