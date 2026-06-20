import { useEffect, useMemo, useState } from 'react';
import { DollarSign, Ticket, Users, UserCheck } from 'lucide-react';
import {
  AnalyticsChart,
  MetricCard,
  PassengerStats,
  TicketStats,
} from '@/components/dashboard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import * as analyticsApi from '@/services/analyticsApi';
import {
  buildAnalyticsView,
  type PassengerAnalyticsResponse,
  type RouteAnalyticsResponse,
  type TicketAnalyticsResponse,
} from '@/utils/analyticsTransform';
import { formatCurrency, getErrorMessage } from '@/utils/token';

export default function AnalyticsPage() {
  const [passengers, setPassengers] = useState<PassengerAnalyticsResponse | null>(null);
  const [tickets, setTickets] = useState<TicketAnalyticsResponse | null>(null);
  const [routes, setRoutes] = useState<RouteAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [passengerData, ticketData, routeData] = await Promise.all([
          analyticsApi.getPassengerAnalytics(),
          analyticsApi.getTicketAnalytics(),
          analyticsApi.getRouteAnalytics(),
        ]);
        setPassengers(passengerData);
        setTickets(ticketData);
        setRoutes(routeData);
      } catch (err) {
        setError(getErrorMessage(err, 'Analytics service unavailable'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const view = useMemo(
    () => buildAnalyticsView(passengers, tickets, routes),
    [passengers, tickets, routes],
  );

  if (loading) {
    return <LoadingSpinner label="Loading analytics..." />;
  }

  const hasRouteData = view.routes.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Aggregated platform metrics from Kafka event streams and the analytics service.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total passengers"
          value={view.passengerSummary.total_registered}
          changeLabel={`${view.newToday} new today`}
          icon={Users}
          accent="green"
        />
        <MetricCard
          title="Active sessions"
          value={view.passengerSummary.active_users}
          changeLabel="Logged-in users"
          icon={UserCheck}
          accent="blue"
        />
        <MetricCard
          title="Total tickets"
          value={view.ticketSummary.tickets_created}
          changeLabel={`${view.activeTickets} active · ${view.ticketsToday} today`}
          icon={Ticket}
          accent="cyan"
        />
        <MetricCard
          title="Revenue"
          value={formatCurrency(view.ticketSummary.total_revenue)}
          changeLabel={`${view.ticketSummary.tickets_cancelled} cancelled`}
          icon={DollarSign}
          accent="amber"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PassengerStats
          data={view.passengerChart}
          summary={view.passengerSummary}
          loading={false}
        />
        <AnalyticsChart
          title="Route activity"
          description="Tickets vs GPS events by route"
          data={view.routeChart}
          dataKey="value"
          secondaryKey="secondary"
          chartType="bar"
          loading={false}
        />
      </section>

      <section className="grid grid-cols-1 gap-6">
        <TicketStats
          data={view.ticketChart}
          summary={view.ticketSummary}
          loading={false}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Route utilization</CardTitle>
          <CardDescription>
            {hasRouteData
              ? `${view.routes.length} routes tracked across the network`
              : 'Route data appears after ticket bookings and GPS events'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasRouteData ? (
            <div className="flex min-h-[120px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
              <p className="text-sm font-medium text-slate-700">No route data yet</p>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                Book a ticket or send GPS updates — the analytics service will aggregate utilization here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-4 py-3 font-semibold text-slate-600">Route</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Tickets</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Avg fare</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {view.routes.map((route) => (
                    <tr key={route.route_id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 font-semibold text-slate-900">{route.route_id}</td>
                      <td className="px-4 py-3 text-slate-700">{route.ticket_count}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {route.avg_fare > 0 ? formatCurrency(route.avg_fare) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 max-w-[140px] overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all"
                              style={{ width: `${Math.min(route.utilization_pct, 100)}%` }}
                            />
                          </div>
                          <span className="w-12 text-right text-xs font-medium text-slate-600">
                            {route.utilization_pct.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
