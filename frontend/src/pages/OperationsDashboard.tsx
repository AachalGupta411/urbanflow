import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bus,
  RefreshCw,
  Ticket,
  Users,
} from 'lucide-react';
import {
  AlertPanel,
  AnalyticsChart,
  FleetCard,
  MetricCard,
  PassengerStats,
  RouteMap,
  TicketStats,
} from '@/components/dashboard';
import { useOperationsDashboard } from '@/hooks/useOperationsDashboard';
import { cn } from '@/lib/utils';

export default function OperationsDashboardPage() {
  const {
    fleet,
    alerts,
    routeChart,
    passengerChart,
    ticketChart,
    metrics,
    ticketSummary,
    passengerSummary,
    loading,
    lastUpdated,
    refresh,
  } = useOperationsDashboard();

  const [selectedVehicle, setSelectedVehicle] = useState<string | undefined>('BUS-001');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Operations Command Center
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time fleet monitoring, ticketing analytics & transit alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="hidden text-xs text-slate-500 sm:inline">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            className={cn(
              'flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition',
              'hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700',
              refreshing && 'opacity-60'
            )}
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* Real-time metrics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Active Fleet"
          value={metrics.activeFleet}
          change={8}
          changeLabel={`${fleet.length} vehicles tracked`}
          icon={Bus}
          accent="blue"
          loading={loading}
        />
        <MetricCard
          title="Tickets Issued"
          value={metrics.totalTickets}
          change={12}
          changeLabel="Last 30 days"
          icon={Ticket}
          accent="cyan"
          loading={loading}
        />
        <MetricCard
          title="Passengers"
          value={metrics.totalPassengers || '—'}
          change={5}
          changeLabel="Total registered"
          icon={Users}
          accent="green"
          loading={loading}
        />
        <MetricCard
          title="Active Alerts"
          value={metrics.alertCount}
          changeLabel={`${alerts.length} total notifications`}
          icon={AlertTriangle}
          accent="amber"
          loading={loading}
        />
        <MetricCard
          title="GPS Events"
          value={metrics.gpsEvents}
          change={15}
          changeLabel="Telemetry ingested"
          icon={Activity}
          accent="blue"
          loading={loading}
        />
      </section>

      {/* Map + Fleet + Alerts */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Fleet Tracking
            </h2>
            <span className="text-xs text-emerald-600">● Live</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {fleet.map((vehicle) => (
              <FleetCard
                key={vehicle.id}
                vehicle={vehicle}
                selected={selectedVehicle === vehicle.id}
                onSelect={setSelectedVehicle}
              />
            ))}
          </div>
        </div>

        <div className="xl:col-span-4">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Route Map
          </h2>
          <RouteMap
            vehicles={fleet}
            selectedVehicleId={selectedVehicle}
          />
        </div>

        <div className="xl:col-span-3">
          <AlertPanel alerts={alerts} loading={loading} />
        </div>
      </section>

      {/* Analytics charts */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnalyticsChart
          title="Route Utilization"
          description="Ticket volume vs GPS telemetry by route"
          data={routeChart}
          dataKey="value"
          secondaryKey="secondary"
          loading={loading}
        />
        <PassengerStats
          data={passengerChart}
          summary={passengerSummary}
          loading={loading}
        />
      </section>

      <section className="grid grid-cols-1 gap-6">
        <TicketStats
          data={ticketChart}
          summary={ticketSummary}
          loading={loading}
        />
      </section>
    </div>
  );
}
