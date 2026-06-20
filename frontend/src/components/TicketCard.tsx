import type { Ticket } from '@/types';
import { ArrowRight, Bus, TrainFront, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/utils/token';

interface TicketCardProps {
  ticket: Ticket;
  onCancel?: (id: number) => void;
  cancelling?: boolean;
}

const statusVariant: Record<Ticket['status'], 'success' | 'muted' | 'default' | 'warning'> = {
  active: 'success',
  cancelled: 'muted',
  used: 'default',
  expired: 'warning',
};

const vehicleIcon = {
  bus: Bus,
  metro: TrainFront,
  ev: Zap,
} as const;

export default function TicketCard({ ticket, onCancel, cancelling }: TicketCardProps) {
  const canCancel = ticket.status === 'active' && onCancel;
  const VehicleIcon = vehicleIcon[ticket.vehicle_type] ?? Bus;

  return (
    <article className="glass-panel animate-slide-in rounded-xl p-5 transition hover:border-teal-200 hover:shadow-md">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600">
            <VehicleIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="flex flex-wrap items-center gap-1.5 text-base font-semibold text-slate-900">
              <span>{ticket.origin}</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              <span>{ticket.destination}</span>
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Route {ticket.route_id} · {ticket.vehicle_type.toUpperCase()}
            </p>
          </div>
        </div>
        <Badge variant={statusVariant[ticket.status]} className="shrink-0 capitalize">
          {ticket.status}
        </Badge>
      </header>

      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Travel date</dt>
          <dd className="mt-1 text-sm font-medium text-slate-800">{formatDate(ticket.travel_date)}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Fare</dt>
          <dd className="mt-1 text-sm font-semibold text-emerald-600">{formatCurrency(ticket.fare)}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Ticket code</dt>
          <dd className="mt-1 font-mono text-xs font-medium text-slate-800">{ticket.ticket_code}</dd>
        </div>
      </dl>

      {canCancel ? (
        <footer className="mt-4 border-t border-slate-100 pt-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={cancelling}
            onClick={() => onCancel(ticket.id)}
            className={cn(
              'text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700',
              cancelling && 'opacity-60',
            )}
          >
            {cancelling ? 'Cancelling…' : 'Cancel ticket'}
          </Button>
        </footer>
      ) : null}
    </article>
  );
}
