import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { FleetVehicle } from './FleetCard';

// Fix default marker icons in Vite bundler
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const busIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background:#3b82f6;width:28px;height:28px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 12px rgba(59,130,246,0.6);display:flex;align-items:center;justify-content:center;font-size:12px;">🚌</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

interface RouteMapProps {
  vehicles: FleetVehicle[];
  selectedVehicleId?: string;
  center?: [number, number];
  zoom?: number;
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [map, center, zoom]);
  return null;
}

export default function RouteMap({
  vehicles,
  selectedVehicleId,
  center = [40.7128, -74.006],
  zoom = 12,
}: RouteMapProps) {
  const activeVehicles = useMemo(
    () => vehicles.filter((v) => v.latitude !== undefined && v.longitude !== undefined),
    [vehicles]
  );

  const selectedTrack = useMemo(() => {
    const selected = activeVehicles.find((v) => v.id === selectedVehicleId);
    if (!selected?.latitude || !selected?.longitude) return [];
    return [[selected.latitude, selected.longitude] as [number, number]];
  }, [activeVehicles, selectedVehicleId]);

  const mapCenter = useMemo((): [number, number] => {
    const selected = activeVehicles.find((v) => v.id === selectedVehicleId);
    if (selected?.latitude && selected?.longitude) {
      return [selected.latitude, selected.longitude];
    }
    if (activeVehicles.length > 0 && activeVehicles[0].latitude && activeVehicles[0].longitude) {
      return [activeVehicles[0].latitude, activeVehicles[0].longitude];
    }
    return center;
  }, [activeVehicles, selectedVehicleId, center]);

  return (
    <div className="glass-panel h-full min-h-[320px] overflow-hidden rounded-xl">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        className="h-full min-h-[320px] w-full rounded-xl"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapController center={mapCenter} zoom={selectedVehicleId ? 14 : zoom} />

        {selectedTrack.length > 0 && (
          <Polyline positions={selectedTrack} pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '8' }} />
        )}

        {activeVehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={[vehicle.latitude!, vehicle.longitude!]}
            icon={busIcon}
            opacity={selectedVehicleId && selectedVehicleId !== vehicle.id ? 0.5 : 1}
          >
            <Popup>
              <div className="text-sm">
                <strong>{vehicle.id}</strong>
                <br />
                Route {vehicle.routeId} · {vehicle.speed.toFixed(0)} km/h
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
