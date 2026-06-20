import type { GpsPosition, Vehicle, VehicleTrackPoint } from '@/types';
import { MapPin, Navigation } from 'lucide-react';
import { formatDateTime } from '@/utils/token';

interface MapViewProps {
  vehicle?: Vehicle | null;
  position?: GpsPosition | null;
  track?: VehicleTrackPoint[];
}

function buildOsmEmbedUrl(lat: number, lng: number): string {
  const delta = 0.02;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export default function MapView({ vehicle, position, track = [] }: MapViewProps) {
  if (!position) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
        <MapPin className="mb-3 h-10 w-10 text-slate-300" />
        <p className="text-sm font-medium text-slate-700">No live GPS position available</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          {vehicle
            ? `${vehicle.vehicleId} is registered but has not reported coordinates yet.`
            : 'Select a vehicle to begin tracking.'}
        </p>
        {vehicle ? (
          <p className="mt-3 rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">
            {vehicle.vehicleType.toUpperCase()} · Route {vehicle.routeId} · {vehicle.status}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <iframe
          title={`Map for ${position.vehicleId}`}
          className="h-[360px] w-full border-0"
          src={buildOsmEmbedUrl(position.latitude, position.longitude)}
          loading="lazy"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: 'Latitude', value: position.latitude.toFixed(5) },
          { label: 'Longitude', value: position.longitude.toFixed(5) },
          { label: 'Speed', value: `${position.speed.toFixed(1)} km/h` },
          { label: 'Heading', value: `${position.heading.toFixed(0)}°` },
          { label: 'Updated', value: formatDateTime(position.recordedAt) },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
          >
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{item.label}</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      {track.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Navigation className="h-4 w-4 text-teal-600" />
            <h4 className="text-sm font-semibold text-slate-900">
              Recent track ({track.length} points)
            </h4>
          </div>
          <ul className="max-h-40 space-y-2 overflow-y-auto">
            {track.slice(0, 8).map((point) => (
              <li
                key={point.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs"
              >
                <span className="font-mono text-slate-700">
                  {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                </span>
                <span className="font-medium text-teal-700">{point.speed.toFixed(0)} km/h</span>
                <span className="text-slate-400">{formatDateTime(point.recordedAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
