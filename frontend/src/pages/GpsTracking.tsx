import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  MapPin,
  Navigation,
  RefreshCw,
  Radio,
  Search,
} from 'lucide-react';
import MapView from '@/components/MapView';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FleetCard, MetricCard } from '@/components/dashboard';
import type { FleetVehicle } from '@/components/dashboard/FleetCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import * as gpsApi from '@/services/gpsApi';
import type { GpsPosition, Vehicle, VehicleTrackPoint } from '@/types';
import { getErrorMessage } from '@/utils/token';

const demoVehicles = ['BUS-001', 'BUS-002', 'METRO-10', 'EV-001'];

function mapFleetStatus(speed: number, status?: string): FleetVehicle['status'] {
  if (status === 'maintenance') return 'maintenance';
  if (status === 'delayed') return 'delayed';
  if (speed === 0 || speed < 5) return 'idle';
  return 'active';
}

export default function GpsTrackingPage() {
  const [vehicleId, setVehicleId] = useState(demoVehicles[0]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [position, setPosition] = useState<GpsPosition | null>(null);
  const [track, setTrack] = useState<VehicleTrackPoint[]>([]);
  const [fleet, setFleet] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchVehicle = useCallback(async (id: string, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const vehicleData = await gpsApi.getVehicle(id);
      setVehicle(vehicleData.vehicle);
      setPosition(vehicleData.position);

      try {
        const trackData = await gpsApi.getVehicleTrack(id, { limit: 20 });
        setTrack(trackData.track);
      } catch {
        setTrack([]);
      }

      setFleet((prev) => {
        const speed = vehicleData.position?.speed ?? 0;
        const updated: FleetVehicle = {
          id: vehicleData.vehicle.vehicleId,
          type: vehicleData.vehicle.vehicleType,
          routeId: vehicleData.vehicle.routeId,
          status: mapFleetStatus(speed, vehicleData.vehicle.status),
          speed,
          latitude: vehicleData.position?.latitude,
          longitude: vehicleData.position?.longitude,
          lastUpdate: vehicleData.position?.recordedAt,
        };
        const others = prev.filter((v) => v.id !== updated.id);
        return [updated, ...others];
      });
    } catch (err) {
      setVehicle(null);
      setPosition(null);
      setTrack([]);
      setError(getErrorMessage(err, 'Failed to load vehicle data'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadFleetOverview = useCallback(async () => {
    setLoading(true);
    setError('');
    const results = await Promise.allSettled(
      demoVehicles.map((id) => gpsApi.getVehicle(id)),
    );

    const fleetData: FleetVehicle[] = results.map((result, index) => {
      const fallbackId = demoVehicles[index];
      if (result.status !== 'fulfilled') {
        return {
          id: fallbackId,
          type: fallbackId.startsWith('METRO') ? 'metro' : fallbackId.startsWith('EV') ? 'ev' : 'bus',
          routeId: 'R-101',
          status: 'idle',
          speed: 0,
        };
      }

      const { vehicle: v, position: p } = result.value;
      const speed = p?.speed ?? 0;
      return {
        id: v.vehicleId,
        type: v.vehicleType,
        routeId: v.routeId,
        status: mapFleetStatus(speed, v.status),
        speed,
        latitude: p?.latitude,
        longitude: p?.longitude,
        lastUpdate: p?.recordedAt,
      };
    });

    setFleet(fleetData);

    const primary = results[0];
    if (primary.status === 'fulfilled') {
      setVehicle(primary.value.vehicle);
      setPosition(primary.value.position);
      try {
        const trackData = await gpsApi.getVehicleTrack(demoVehicles[0], { limit: 20 });
        setTrack(trackData.track);
      } catch {
        setTrack([]);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadFleetOverview();
  }, [loadFleetOverview]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const interval = window.setInterval(() => {
      void fetchVehicle(vehicleId, true);
    }, 10000);
    return () => window.clearInterval(interval);
  }, [autoRefresh, vehicleId, fetchVehicle]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void fetchVehicle(vehicleId.trim());
  };

  const selectVehicle = (id: string) => {
    setVehicleId(id);
    void fetchVehicle(id);
  };

  const stats = useMemo(() => {
    const live = fleet.filter((v) => v.latitude !== undefined).length;
    const active = fleet.filter((v) => v.status === 'active').length;
    return {
      fleetSize: fleet.length,
      live,
      active,
      trackPoints: track.length,
      speed: position?.speed ?? 0,
    };
  }, [fleet, track.length, position?.speed]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Fleet Tracking
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor live vehicle positions and recent route history from the GPS service.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => void fetchVehicle(vehicleId, true)}
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

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Fleet size"
          value={stats.fleetSize}
          changeLabel={`${stats.live} reporting GPS`}
          icon={MapPin}
          accent="blue"
          loading={loading}
        />
        <MetricCard
          title="Active vehicles"
          value={stats.active}
          changeLabel="Currently moving"
          icon={Activity}
          accent="green"
          loading={loading}
        />
        <MetricCard
          title="Current speed"
          value={position ? `${stats.speed.toFixed(0)} km/h` : '—'}
          changeLabel={vehicle ? vehicle.vehicleId : 'No vehicle selected'}
          icon={Navigation}
          accent="cyan"
          loading={loading}
        />
        <MetricCard
          title="Track points"
          value={stats.trackPoints}
          changeLabel="Recent history loaded"
          icon={Radio}
          accent="amber"
          loading={loading}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Track vehicle</CardTitle>
              <CardDescription>Search by ID or pick from the fleet list</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="vehicle-id">Vehicle ID</Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="vehicle-id"
                      type="text"
                      className="pl-10"
                      value={vehicleId}
                      onChange={(e) => setVehicleId(e.target.value)}
                      placeholder="e.g. BUS-001"
                      list="demo-vehicles"
                      required
                    />
                    <datalist id="demo-vehicles">
                      {demoVehicles.map((id) => (
                        <option key={id} value={id} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                  Auto-refresh every 10 seconds
                </label>

                <Button type="submit" variant="teal" className="w-full" disabled={loading && !vehicle}>
                  {loading && !vehicle ? 'Loading…' : 'Track vehicle'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Fleet overview
              </h2>
              <Badge variant="muted">{fleet.length} vehicles</Badge>
            </div>
            <div className="space-y-3">
              {fleet.map((item) => (
                <FleetCard
                  key={item.id}
                  vehicle={item}
                  selected={vehicleId === item.id}
                  onSelect={selectVehicle}
                />
              ))}
            </div>
          </div>
        </div>

        <Card className="xl:col-span-8">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Live map</CardTitle>
              <CardDescription>
                {vehicle
                  ? `${vehicle.vehicleId} · ${vehicle.vehicleType.toUpperCase()} · Route ${vehicle.routeId}`
                  : 'Select a vehicle to view its position'}
              </CardDescription>
            </div>
            {vehicle ? (
              <Badge variant={vehicle.status === 'active' ? 'success' : 'muted'} className="capitalize">
                {vehicle.status}
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent>
            {loading && !vehicle ? (
              <LoadingSpinner label="Fetching GPS data..." />
            ) : (
              <MapView vehicle={vehicle} position={position} track={track} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
