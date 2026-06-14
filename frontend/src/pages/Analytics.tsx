import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatCard from '@/components/StatCard';
import * as analyticsApi from '@/services/analyticsApi';
import type { AnalyticsPassengers, AnalyticsRoutes, AnalyticsTickets } from '@/types';
import { formatCurrency, getErrorMessage } from '@/utils/token';

export default function AnalyticsPage() {
  const [passengerStats, setPassengerStats] = useState<AnalyticsPassengers | null>(null);
  const [ticketStats, setTicketStats] = useState<AnalyticsTickets | null>(null);
  const [routeStats, setRouteStats] = useState<AnalyticsRoutes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [passengers, tickets, routes] = await Promise.all([
          analyticsApi.getPassengerAnalytics(),
          analyticsApi.getTicketAnalytics(),
          analyticsApi.getRouteAnalytics(),
        ]);
        setPassengerStats(passengers);
        setTicketStats(tickets);
        setRouteStats(routes);
      } catch (err) {
        setError(getErrorMessage(err, 'Analytics service unavailable'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading analytics..." />;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Analytics</h1>
          <p className="text-muted">Aggregated platform metrics from Kafka event streams and the analytics service.</p>
        </div>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="stat-grid">
        <StatCard
          label="Total passengers"
          value={passengerStats?.total_passengers ?? '—'}
          hint={passengerStats ? `${passengerStats.new_today} new today` : undefined}
          accent="purple"
        />
        <StatCard
          label="Active sessions"
          value={passengerStats?.active_sessions ?? '—'}
          accent="blue"
        />
        <StatCard
          label="Total tickets"
          value={ticketStats?.total_tickets ?? '—'}
          hint={ticketStats ? `${ticketStats.active_tickets} active` : undefined}
          accent="green"
        />
        <StatCard
          label="Revenue"
          value={ticketStats ? formatCurrency(ticketStats.revenue_total) : '—'}
          hint={ticketStats ? `${ticketStats.cancelled_tickets} cancelled` : undefined}
          accent="amber"
        />
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Route utilization</h2>
          <span className="text-muted">{routeStats?.routes.length ?? 0} routes tracked</span>
        </div>

        {!routeStats || routeStats.routes.length === 0 ? (
          <div className="empty-state">
            <p>Route analytics will populate as ticket and GPS events are consumed.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Tickets</th>
                  <th>Avg fare</th>
                  <th>Utilization</th>
                </tr>
              </thead>
              <tbody>
                {routeStats.routes.map((route) => (
                  <tr key={route.route_id}>
                    <td><strong>{route.route_id}</strong></td>
                    <td>{route.ticket_count}</td>
                    <td>{formatCurrency(route.avg_fare)}</td>
                    <td>
                      <div className="util-bar-wrap">
                        <div className="util-bar" style={{ width: `${Math.min(route.utilization_pct, 100)}%` }} />
                        <span>{route.utilization_pct.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
