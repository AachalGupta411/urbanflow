import { useCallback, useEffect, useState } from 'react';
import * as analyticsApi from '@/services/analyticsApi';
import * as gpsApi from '@/services/gpsApi';
import * as notificationApi from '@/services/notificationApi';
import * as ticketingApi from '@/services/ticketingApi';
import type { FleetVehicle } from '@/components/dashboard/FleetCard';
import type { ChartDataPoint } from '@/components/dashboard/AnalyticsChart';
import type { Notification } from '@/types';

const FLEET_IDS = ['BUS-001', 'BUS-002', 'METRO-10', 'EV-001'];

const DEMO_FLEET: FleetVehicle[] = [
  { id: 'BUS-001', type: 'bus', routeId: 'R-101', status: 'active', speed: 42, latitude: 40.7128, longitude: -74.006 },
  { id: 'BUS-002', type: 'bus', routeId: 'R-101', status: 'idle', speed: 0, latitude: 40.7282, longitude: -73.9942 },
  { id: 'METRO-10', type: 'metro', routeId: 'R-202', status: 'active', speed: 65, latitude: 40.758, longitude: -73.9855 },
  { id: 'EV-001', type: 'ev', routeId: 'R-303', status: 'active', speed: 38, latitude: 40.6892, longitude: -74.0445 },
];

interface AnalyticsApiPassengers {
  summary?: { total_registered: number; active_users: number };
  daily?: Array<{ stat_date: string; total_registered: number; active_users: number }>;
}

interface AnalyticsApiTickets {
  summary?: { tickets_created: number; tickets_cancelled: number; total_revenue: number };
  daily?: Array<{ stat_date: string; vehicle_type: string; tickets_created: number; tickets_cancelled: number; total_revenue: number }>;
}

interface AnalyticsApiRoutes {
  summary?: { ticket_count: number; gps_event_count: number };
  daily?: Array<{ route_id: string; ticket_count: number; gps_event_count: number }>;
}

export interface OperationsDashboardData {
  fleet: FleetVehicle[];
  alerts: Notification[];
  routeChart: ChartDataPoint[];
  passengerChart: Array<{ label: string; registered: number; active: number }>;
  ticketChart: Array<{ label: string; created: number; cancelled: number; revenue: number }>;
  metrics: {
    activeFleet: number;
    totalTickets: number;
    totalPassengers: number;
    alertCount: number;
    gpsEvents: number;
  };
  ticketSummary?: AnalyticsApiTickets['summary'];
  passengerSummary?: AnalyticsApiPassengers['summary'];
  loading: boolean;
  lastUpdated: Date | null;
}

function mapFleetStatus(speed: number, status?: string): FleetVehicle['status'] {
  if (status === 'maintenance') return 'maintenance';
  if (speed === 0) return 'delayed';
  if (speed < 5) return 'idle';
  return 'active';
}

function normalizeNotification(raw: Record<string, unknown>): Notification {
  return {
    id: Number(raw.id),
    type: (raw.type as Notification['type']) ?? 'system',
    title: String(raw.title ?? 'Alert'),
    message: String(raw.message ?? ''),
    route_id: raw.route_id as string | null | undefined,
    read: Boolean(raw.is_read ?? raw.read ?? false),
    created_at: String(raw.created_at ?? new Date().toISOString()),
  };
}

export function useOperationsDashboard(pollMs = 30000) {
  const [data, setData] = useState<OperationsDashboardData>({
    fleet: DEMO_FLEET,
    alerts: [],
    routeChart: [],
    passengerChart: [],
    ticketChart: [],
    metrics: { activeFleet: 3, totalTickets: 0, totalPassengers: 0, alertCount: 0, gpsEvents: 0 },
    loading: true,
    lastUpdated: null,
  });

  const refresh = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: prev.lastUpdated === null }));

    try {
      const [fleetResults, alertsRaw, passengerAnalytics, ticketAnalytics, routeAnalytics, tickets] =
        await Promise.all([
          Promise.allSettled(FLEET_IDS.map((id) => gpsApi.getVehicle(id))),
          notificationApi.listNotifications().catch(() => []),
          analyticsApi.getPassengerAnalytics().catch(() => null) as Promise<AnalyticsApiPassengers | null>,
          analyticsApi.getTicketAnalytics().catch(() => null) as Promise<AnalyticsApiTickets | null>,
          analyticsApi.getRouteAnalytics().catch(() => null) as Promise<AnalyticsApiRoutes | null>,
          ticketingApi.listTickets().catch(() => []),
        ]);

      const fleet: FleetVehicle[] = fleetResults.map((result, i) => {
        const fallback = DEMO_FLEET[i] ?? DEMO_FLEET[0];
        if (result.status !== 'fulfilled') return fallback;

        const { vehicle, position } = result.value;
        const speed = position?.speed ?? 0;
        return {
          id: vehicle.vehicleId ?? fallback.id,
          type: (vehicle.vehicleType ?? fallback.type) as FleetVehicle['type'],
          routeId: vehicle.routeId ?? fallback.routeId,
          status: mapFleetStatus(speed, vehicle.status),
          speed,
          latitude: position?.latitude ?? fallback.latitude,
          longitude: position?.longitude ?? fallback.longitude,
          lastUpdate: position?.recordedAt,
        };
      });

      const alerts = (alertsRaw as Record<string, unknown>[]).map(normalizeNotification);

      const passengerChart =
        passengerAnalytics?.daily?.slice(-7).map((row) => ({
          label: new Date(row.stat_date).toLocaleDateString([], { weekday: 'short' }),
          registered: row.total_registered,
          active: row.active_users,
        })) ?? generateDemoPassengerChart();

      const ticketByType = new Map<string, { created: number; cancelled: number; revenue: number }>();
      ticketAnalytics?.daily?.forEach((row) => {
        const existing = ticketByType.get(row.vehicle_type) ?? { created: 0, cancelled: 0, revenue: 0 };
        ticketByType.set(row.vehicle_type, {
          created: existing.created + row.tickets_created,
          cancelled: existing.cancelled + row.tickets_cancelled,
          revenue: existing.revenue + Number(row.total_revenue),
        });
      });

      const ticketChart =
        ticketByType.size > 0
          ? Array.from(ticketByType.entries()).map(([label, stats]) => ({ label, ...stats }))
          : [
              { label: 'Bus', created: tickets.length || 12, cancelled: 1, revenue: 66 },
              { label: 'Metro', created: 8, cancelled: 0, revenue: 40 },
              { label: 'EV', created: 5, cancelled: 0, revenue: 27.5 },
            ];

      const routeChart: ChartDataPoint[] =
        routeAnalytics?.daily?.slice(-7).map((row) => ({
          label: row.route_id,
          value: row.ticket_count,
          secondary: row.gps_event_count,
        })) ?? [
          { label: 'R-101', value: 45, secondary: 120 },
          { label: 'R-202', value: 32, secondary: 89 },
          { label: 'R-303', value: 18, secondary: 54 },
        ];

      setData({
        fleet,
        alerts,
        routeChart,
        passengerChart,
        ticketChart,
        ticketSummary: ticketAnalytics?.summary,
        passengerSummary: passengerAnalytics?.summary,
        metrics: {
          activeFleet: fleet.filter((v) => v.status === 'active').length,
          totalTickets: ticketAnalytics?.summary?.tickets_created ?? tickets.length,
          totalPassengers: passengerAnalytics?.summary?.total_registered ?? 0,
          alertCount: alerts.filter((a) => !a.read).length,
          gpsEvents: routeAnalytics?.summary?.gps_event_count ?? 263,
        },
        loading: false,
        lastUpdated: new Date(),
      });
    } catch {
      setData((prev) => ({
        ...prev,
        fleet: DEMO_FLEET,
        loading: false,
        lastUpdated: new Date(),
      }));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), pollMs);
    return () => clearInterval(interval);
  }, [refresh, pollMs]);

  return { ...data, refresh };
}

function generateDemoPassengerChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((label, i) => ({
    label,
    registered: 2 + i * 3,
    active: 1 + i * 2,
  }));
}
