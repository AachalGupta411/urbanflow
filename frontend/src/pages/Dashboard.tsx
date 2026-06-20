import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatCard from '@/components/StatCard';
import TicketCard from '@/components/TicketCard';
import { useAuth } from '@/hooks/useAuth';
import * as analyticsApi from '@/services/analyticsApi';
import * as ticketingApi from '@/services/ticketingApi';
import type { Ticket } from '@/types';
import { buildAnalyticsView } from '@/utils/analyticsTransform';
import { formatCurrency, getErrorMessage } from '@/utils/token';

export default function DashboardPage() {
  const { passenger } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [analyticsView, setAnalyticsView] = useState<ReturnType<typeof buildAnalyticsView> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [ticketList, pStats, tStats] = await Promise.all([
          ticketingApi.listTickets(),
          analyticsApi.getPassengerAnalytics().catch(() => null),
          analyticsApi.getTicketAnalytics().catch(() => null),
        ]);
        setTickets(ticketList);
        setAnalyticsView(buildAnalyticsView(pStats, tStats, null));
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load dashboard'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const activeTickets = tickets.filter((t) => t.status === 'active').length;

  if (loading) {
    return <LoadingSpinner label="Loading dashboard..." />;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">Welcome back, {passenger?.full_name}. Here is your transit overview.</p>
        </div>
        <Link to="/tickets" className="btn btn-primary">Book a ticket</Link>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="stat-grid">
        <StatCard label="Your active tickets" value={activeTickets} accent="blue" />
        <StatCard
          label="Total bookings"
          value={tickets.length}
          hint="All time on your account"
          accent="green"
        />
        <StatCard
          label="Platform passengers"
          value={analyticsView?.passengerSummary.total_registered ?? '—'}
          hint={
            analyticsView
              ? `${analyticsView.newToday} joined today`
              : 'Analytics service offline'
          }
          accent="purple"
        />
        <StatCard
          label="Platform revenue"
          value={
            analyticsView ? formatCurrency(analyticsView.ticketSummary.total_revenue) : '—'
          }
          hint={
            analyticsView
              ? `${analyticsView.ticketsToday} tickets today`
              : 'Analytics service offline'
          }
          accent="amber"
        />
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Recent tickets</h2>
          <Link to="/tickets" className="link">View all</Link>
        </div>

        {tickets.length === 0 ? (
          <div className="empty-state">
            <p>No tickets yet.</p>
            <Link to="/tickets" className="btn btn-secondary">Book your first ride</Link>
          </div>
        ) : (
          <div className="ticket-grid">
            {tickets.slice(0, 3).map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </section>

      <section className="quick-links panel">
        <h2>Quick actions</h2>
        <div className="quick-link-grid">
          <Link to="/tracking" className="quick-link-card">
            <strong>GPS Tracking</strong>
            <span>Live vehicle positions</span>
          </Link>
          <Link to="/notifications" className="quick-link-card">
            <strong>Notifications</strong>
            <span>Delays and route alerts</span>
          </Link>
          <Link to="/analytics" className="quick-link-card">
            <strong>Analytics</strong>
            <span>Route utilization stats</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
