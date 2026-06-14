import type { GpsPosition, Vehicle, VehicleTrackPoint } from '@/types';
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
      <div className="map-placeholder">
        <p>No live GPS position available for this vehicle.</p>
        {vehicle ? (
          <p className="text-muted">
            {vehicle.vehicleId} · {vehicle.vehicleType} · Route {vehicle.routeId}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="map-view">
      <div className="map-frame-wrap">
        <iframe
          title={`Map for ${position.vehicleId}`}
          className="map-frame"
          src={buildOsmEmbedUrl(position.latitude, position.longitude)}
          loading="lazy"
        />
      </div>

      <div className="map-details">
        <div className="map-stats">
          <div>
            <span className="label">Latitude</span>
            <strong>{position.latitude.toFixed(5)}</strong>
          </div>
          <div>
            <span className="label">Longitude</span>
            <strong>{position.longitude.toFixed(5)}</strong>
          </div>
          <div>
            <span className="label">Speed</span>
            <strong>{position.speed.toFixed(1)} km/h</strong>
          </div>
          <div>
            <span className="label">Heading</span>
            <strong>{position.heading.toFixed(0)}°</strong>
          </div>
          <div>
            <span className="label">Updated</span>
            <strong>{formatDateTime(position.recordedAt)}</strong>
          </div>
        </div>

        {track.length > 0 ? (
          <div className="track-list">
            <h4>Recent track ({track.length} points)</h4>
            <ul>
              {track.slice(0, 8).map((point) => (
                <li key={point.id}>
                  <span className="mono">
                    {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                  </span>
                  <span>{point.speed.toFixed(0)} km/h</span>
                  <span className="text-muted">{formatDateTime(point.recordedAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
