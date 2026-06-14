import { FormEvent, useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import TicketCard from '@/components/TicketCard';
import * as ticketingApi from '@/services/ticketingApi';
import type { CreateTicketPayload, Ticket, VehicleType } from '@/types';
import { getErrorMessage } from '@/utils/token';

const demoRoutes = [
  { id: 'R-101', origin: 'Central Station', destination: 'Airport Terminal', fare: 4.5 },
  { id: 'R-202', origin: 'University Campus', destination: 'Downtown Hub', fare: 2.75 },
  { id: 'R-303', origin: 'North Park', destination: 'EV Depot', fare: 3.25 },
];

const vehicleTypes: VehicleType[] = ['bus', 'metro', 'ev'];

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
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

  const loadTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ticketingApi.listTickets();
      setTickets(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load tickets'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTickets();
  }, []);

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
      setSuccess(`Ticket booked! Code: ${ticket.ticket_code}`);
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
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Tickets</h1>
          <p className="text-muted">Book, view, and cancel transit tickets across bus, metro, and EV routes.</p>
        </div>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="split-layout">
        <section className="panel">
          <h2>Book a ticket</h2>
          <form className="form-stack" onSubmit={handleSubmit}>
            <label>
              Route
              <select
                value={form.route_id}
                onChange={(e) => handleRouteChange(e.target.value)}
              >
                {demoRoutes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.id}: {route.origin} → {route.destination}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Vehicle type
              <select
                value={form.vehicle_type}
                onChange={(e) => setForm((prev) => ({ ...prev, vehicle_type: e.target.value as VehicleType }))}
              >
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>{type.toUpperCase()}</option>
                ))}
              </select>
            </label>

            <div className="form-row">
              <label>
                Origin
                <input
                  type="text"
                  value={form.origin}
                  onChange={(e) => setForm((prev) => ({ ...prev, origin: e.target.value }))}
                  required
                />
              </label>
              <label>
                Destination
                <input
                  type="text"
                  value={form.destination}
                  onChange={(e) => setForm((prev) => ({ ...prev, destination: e.target.value }))}
                  required
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Fare (USD)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.fare}
                  onChange={(e) => setForm((prev) => ({ ...prev, fare: parseFloat(e.target.value) }))}
                  required
                />
              </label>
              <label>
                Travel date
                <input
                  type="date"
                  value={form.travel_date}
                  onChange={(e) => setForm((prev) => ({ ...prev, travel_date: e.target.value }))}
                  required
                />
              </label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Booking...' : 'Book ticket'}
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Your bookings</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => void loadTickets()}>
              Refresh
            </button>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading tickets..." size="sm" />
          ) : tickets.length === 0 ? (
            <div className="empty-state">
              <p>No bookings found. Create your first ticket to get started.</p>
            </div>
          ) : (
            <div className="ticket-grid">
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
        </section>
      </div>
    </div>
  );
}
