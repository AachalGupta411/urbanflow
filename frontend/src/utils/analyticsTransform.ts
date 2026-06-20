import type { RouteAnalytics } from '@/types';

export interface PassengerAnalyticsResponse {
  from?: string;
  to?: string;
  summary?: { total_registered: number; active_users: number };
  daily?: Array<{ stat_date: string; total_registered: number; active_users: number }>;
  cached?: boolean;
}

export interface TicketAnalyticsResponse {
  from?: string;
  to?: string;
  vehicle_type?: string | null;
  summary?: { tickets_created: number; tickets_cancelled: number; total_revenue: number };
  daily?: Array<{
    stat_date: string;
    vehicle_type: string;
    tickets_created: number;
    tickets_cancelled: number;
    total_revenue: number;
  }>;
  cached?: boolean;
}

export interface RouteAnalyticsResponse {
  from?: string;
  to?: string;
  route_id?: string | null;
  summary?: { ticket_count: number; gps_event_count: number };
  daily?: Array<{
    route_id: string;
    stat_date: string;
    ticket_count: number;
    gps_event_count: number;
    avg_occupancy: number;
  }>;
  cached?: boolean;
}

export interface AnalyticsViewModel {
  passengerSummary: { total_registered: number; active_users: number };
  newToday: number;
  ticketSummary: { tickets_created: number; tickets_cancelled: number; total_revenue: number };
  activeTickets: number;
  ticketsToday: number;
  passengerChart: Array<{ label: string; registered: number; active: number }>;
  ticketChart: Array<{ label: string; created: number; cancelled: number; revenue: number }>;
  routeChart: Array<{ label: string; value: number; secondary: number }>;
  routes: RouteAnalytics[];
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildAnalyticsView(
  passengers: PassengerAnalyticsResponse | null,
  tickets: TicketAnalyticsResponse | null,
  routes: RouteAnalyticsResponse | null,
): AnalyticsViewModel {
  const passengerSummary = passengers?.summary ?? { total_registered: 0, active_users: 0 };
  const ticketSummary = tickets?.summary ?? { tickets_created: 0, tickets_cancelled: 0, total_revenue: 0 };

  const today = todayIso();
  const todayPassenger = passengers?.daily?.find((row) => row.stat_date === today);
  const newToday = todayPassenger?.total_registered ?? 0;

  const ticketsToday =
    tickets?.daily
      ?.filter((row) => row.stat_date === today)
      .reduce((sum, row) => sum + row.tickets_created, 0) ?? 0;

  const activeTickets = Math.max(0, ticketSummary.tickets_created - ticketSummary.tickets_cancelled);

  const passengerChart =
    passengers?.daily?.slice(-7).map((row) => ({
      label: new Date(row.stat_date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
      registered: row.total_registered,
      active: row.active_users,
    })) ?? [];

  const ticketByType = new Map<string, { created: number; cancelled: number; revenue: number }>();
  tickets?.daily?.forEach((row) => {
    const existing = ticketByType.get(row.vehicle_type) ?? { created: 0, cancelled: 0, revenue: 0 };
    ticketByType.set(row.vehicle_type, {
      created: existing.created + row.tickets_created,
      cancelled: existing.cancelled + row.tickets_cancelled,
      revenue: existing.revenue + Number(row.total_revenue),
    });
  });

  const ticketChart = Array.from(ticketByType.entries()).map(([label, stats]) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    ...stats,
  }));

  const routeAgg = new Map<
    string,
    { ticket_count: number; gps_event_count: number; occupancyTotal: number; days: number }
  >();

  routes?.daily?.forEach((row) => {
    const existing = routeAgg.get(row.route_id) ?? {
      ticket_count: 0,
      gps_event_count: 0,
      occupancyTotal: 0,
      days: 0,
    };
    routeAgg.set(row.route_id, {
      ticket_count: existing.ticket_count + row.ticket_count,
      gps_event_count: existing.gps_event_count + row.gps_event_count,
      occupancyTotal: existing.occupancyTotal + Number(row.avg_occupancy),
      days: existing.days + 1,
    });
  });

  const routeList: RouteAnalytics[] = Array.from(routeAgg.entries())
    .map(([route_id, stats]) => ({
      route_id,
      ticket_count: stats.ticket_count,
      avg_fare:
        stats.ticket_count > 0 && ticketSummary.total_revenue > 0
          ? ticketSummary.total_revenue / Math.max(ticketSummary.tickets_created, 1)
          : 0,
      utilization_pct: stats.days > 0 ? stats.occupancyTotal / stats.days : 0,
    }))
    .sort((a, b) => b.ticket_count - a.ticket_count);

  const routeChart = routeList.slice(0, 7).map((route) => ({
    label: route.route_id,
    value: route.ticket_count,
    secondary: routeAgg.get(route.route_id)?.gps_event_count ?? 0,
  }));

  return {
    passengerSummary,
    newToday,
    ticketSummary,
    activeTickets,
    ticketsToday,
    passengerChart,
    ticketChart,
    routeChart,
    routes: routeList,
  };
}
