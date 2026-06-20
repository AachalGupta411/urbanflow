import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Bus, RefreshCw, Ticket, TrainFront, Zap } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import TicketCard from '@/components/TicketCard';
import { MetricCard } from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatCurrency } from '@/lib/utils';
import * as ticketingApi from '@/services/ticketingApi';
import type { CreateTicketPayload, Ticket as TicketType, VehicleType } from '@/types';
import { getErrorMessage } from '@/utils/token';

const demoRoutes = [
  { id: 'R-101', origin: 'Central Station', destination: 'Airport Terminal', fare: 4.5 },
  { id: 'R-202', origin: 'University Campus', destination: 'Downtown Hub', fare: 2.75 },
  { id: 'R-303', origin: 'North Park', destination: 'EV Depot', fare: 3.25 },
];

const vehicleTypes: { value: VehicleType; label: string; icon: typeof Bus }[] = [
  { value: 'bus', label: 'Bus', icon: Bus },
  { value: 'metro', label: 'Metro', icon: TrainFront },
  { value: 'ev', label: 'EV', icon: Zap },
];

const selectClassName =
  'flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:border-teal-500';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState<CreateTicketPayload>({
    route_id: demoRoutes[0].id,
    vehicle_type: 'bus',
    origin: demoRoutes[0].origin,
    destination: demoRoutes[0].destination,
    fare: demoRoutes[0].fare,
    travel_date: new Date().toISOString().slice(0, 10),
  });

  const loadTickets = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const data = await ticketingApi.listTickets();
      setTickets(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load tickets'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadTickets();
  }, []);

  const stats = useMemo(() => {
    const active = tickets.filter((t) => t.status === 'active').length;
    const cancelled = tickets.filter((t) => t.status === 'cancelled').length;
    const spent = tickets
      .filter((t) => t.status !== 'cancelled')
      .reduce((sum, t) => sum + Number(t.fare), 0);
    return { total: tickets.length, active, cancelled, spent };
  }, [tickets]);

  const selectedRoute = demoRoutes.find((r) => r.id === form.route_id) ?? demoRoutes[0];

  const handleRouteChange = (routeId: string) => {
    const route = demoRoutes.find((r) => r.id === routeId);
    if (!route) return;
    setForm((prev) => ({
      ...prev,
      route_id: route.id,
      origin: route.origin,
      destination: route.destination,
      fare: route.fare,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const ticket = await ticketingApi.createTicket(form);
      setTickets((prev) => [ticket, ...prev]);
      setSuccess(`Ticket booked successfully! Your code is ${ticket.ticket_code}.`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create ticket'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: number) => {
    setCancellingId(id);
    setError('');
    setSuccess('');
    try {
      const updated = await ticketingApi.cancelTicket(id);
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setSuccess('Ticket cancelled successfully.');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to cancel ticket'));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Ticketing</h1>
          <p className="mt-1 text-sm text-slate-500">
            Book, view, and cancel transit tickets across bus, metro, and EV routes.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => void loadTickets(true)}
          disabled={refreshing}
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total bookings"
          value={stats.total}
          changeLabel={`${stats.active} active`}
          icon={Ticket}
          accent="blue"
          loading={loading}
        />
        <MetricCard
          title="Active tickets"
          value={stats.active}
          changeLabel="Ready to travel"
          icon={Bus}
          accent="green"
          loading={loading}
        />
        <MetricCard
          title="Cancelled"
          value={stats.cancelled}
          changeLabel="Refunded or voided"
          icon={Ticket}
          accent="amber"
          loading={loading}
        />
        <MetricCard
          title="Total spent"
          value={formatCurrency(stats.spent)}
          changeLabel="Excluding cancelled"
          icon={Zap}
          accent="cyan"
          loading={loading}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-5">
          <CardHeader>
            <CardTitle>Book a ticket</CardTitle>
            <CardDescription>
              Select a route and travel details — fare is calculated automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-5 rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50 to-blue-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-teal-700">Selected route</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{selectedRoute.id}</p>
              <p className="mt-0.5 text-sm text-slate-600">
                {selectedRoute.origin} → {selectedRoute.destination}
              </p>
              <p className="mt-2 text-sm font-semibold text-emerald-600">
                From {formatCurrency(selectedRoute.fare)}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="ticket-route">Route</Label>
                <select
                  id="ticket-route"
                  className={selectClassName}
                  value={form.route_id}
                  onChange={(e) => handleRouteChange(e.target.value)}
                >
                  {demoRoutes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.id}: {route.origin} → {route.destination}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticket-vehicle">Vehicle type</Label>
                <select
                  id="ticket-vehicle"
                  className={selectClassName}
                  value={form.vehicle_type}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, vehicle_type: e.target.value as VehicleType }))
                  }
                >
                  {vehicleTypes.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ticket-origin">Origin</Label>
                  <Input
                    id="ticket-origin"
                    type="text"
                    value={form.origin}
                    onChange={(e) => setForm((prev) => ({ ...prev, origin: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticket-destination">Destination</Label>
                  <Input
                    id="ticket-destination"
                    type="text"
                    value={form.destination}
                    onChange={(e) => setForm((prev) => ({ ...prev, destination: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ticket-fare">Fare (USD)</Label>
                  <Input
                    id="ticket-fare"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.fare}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, fare: parseFloat(e.target.value) || 0 }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticket-date">Travel date</Label>
                  <Input
                    id="ticket-date"
                    type="date"
                    value={form.travel_date}
                    onChange={(e) => setForm((prev) => ({ ...prev, travel_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <Button type="submit" variant="teal" className="w-full" disabled={submitting}>
                {submitting ? 'Booking…' : 'Book ticket'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="xl:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Your bookings</CardTitle>
              <CardDescription>Tickets linked to your passenger account</CardDescription>
            </div>
            <Badge variant="muted">{tickets.length} total</Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSpinner label="Loading tickets..." size="sm" />
            ) : tickets.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                <Ticket className="mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm font-medium text-slate-700">No bookings yet</p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Use the form on the left to book your first ride on any UrbanFlow route.
                </p>
              </div>
            ) : (
              <div className="grid max-h-[620px] gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
                {tickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onCancel={handleCancel}
                    cancelling={cancellingId === ticket.id}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
