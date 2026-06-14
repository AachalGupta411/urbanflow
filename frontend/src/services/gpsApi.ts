import { gpsClient } from './api';
import type { GpsPosition, Vehicle, VehicleTrackPoint } from '@/types';

export async function getVehicle(vehicleId: string): Promise<{ vehicle: Vehicle; position: GpsPosition | null }> {
  const { data } = await gpsClient.get<{ vehicle: Vehicle; position: GpsPosition | null }>(
    `/api/gps/vehicles/${encodeURIComponent(vehicleId)}`
  );
  return data;
}

export async function getVehicleTrack(
  vehicleId: string,
  params?: { limit?: number; from?: string; to?: string }
): Promise<{ vehicleId: string; count: number; track: VehicleTrackPoint[] }> {
  const { data } = await gpsClient.get<{ vehicleId: string; count: number; track: VehicleTrackPoint[] }>(
    `/api/gps/vehicles/${encodeURIComponent(vehicleId)}/track`,
    { params }
  );
  return data;
}

export async function postCoordinates(payload: {
  vehicle_id: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
}): Promise<void> {
  await gpsClient.post('/api/gps/coordinates', payload);
}

export async function updateRoute(
  routeId: string,
  payload: { status?: string; name?: string; description?: string }
): Promise<unknown> {
  const { data } = await gpsClient.put(`/api/gps/routes/${encodeURIComponent(routeId)}`, payload);
  return data;
}
