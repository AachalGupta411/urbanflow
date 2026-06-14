import { FormEvent, useEffect, useState } from 'react';
import MapView from '@/components/MapView';
import LoadingSpinner from '@/components/LoadingSpinner';
import * as gpsApi from '@/services/gpsApi';
import type { GpsPosition, Vehicle, VehicleTrackPoint } from '@/types';
import { getErrorMessage } from '@/utils/token';

const demoVehicles = ['BUS-001', 'BUS-002', 'METRO-10', 'EV-001'];

export default function GpsTrackingPage() {
  const [vehicleId, setVehicleId] = useState(demoVehicles[0]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [position, setPosition] = useState<GpsPosition | null>(null);
  const [track, setTrack] = useState<VehicleTrackPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchVehicle = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const vehicleData = await gpsApi.getVehicle(id);
      setVehicle(vehicleData.vehicle);
      setPosition(vehicleData.position);

      try {
        const trackData = await gpsApi.getVehicleTrack(id, { limit: 20 });
        setTrack(trackData.track);
      } catch {
        // Track history is optional — vehicle lookup succeeded
        setTrack([]);
      }
    } catch (err) {
      setVehicle(null);
      setPosition(null);
      setTrack([]);
      setError(getErrorMessage(err, 'Failed to load vehicle data'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void fetchVehicle(vehicleId.trim());
  };

  useEffect(() => {
    void fetchVehicle(vehicleId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const interval = window.setInterval(() => {
      void fetchVehicle(vehicleId);
    }, 10000);
    return () => window.clearInterval(interval);
  }, [autoRefresh, vehicleId]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>GPS Tracking</h1>
          <p className="text-muted">Monitor live vehicle positions and recent route history from the GPS service.</p>
        </div>
      </header>

      <section className="panel">
        <form className="tracking-form" onSubmit={handleSubmit}>
          <label>
            Vehicle ID
            <input
              type="text"
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
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh every 10s
          </label>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading...' : 'Track vehicle'}
          </button>
        </form>

        <div className="chip-row">
          {demoVehicles.map((id) => (
            <button
              key={id}
              type="button"
              className={`chip ${vehicleId === id ? 'active' : ''}`}
              onClick={() => {
                setVehicleId(id);
                void fetchVehicle(id);
              }}
            >
              {id}
            </button>
          ))}
        </div>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}

      {loading && !vehicle ? (
        <LoadingSpinner label="Fetching GPS data..." />
      ) : (
        <section className="panel">
          {vehicle ? (
            <div className="vehicle-summary">
              <div>
                <h2>{vehicle.vehicleId}</h2>
                <p className="text-muted">
                  {vehicle.vehicleType.toUpperCase()} · Route {vehicle.routeId} · {vehicle.status}
                </p>
              </div>
              <span className={`badge ${vehicle.status === 'active' ? 'badge-success' : 'badge-muted'}`}>
                {vehicle.status}
              </span>
            </div>
          ) : null}
          <MapView vehicle={vehicle} position={position} track={track} />
        </section>
      )}
    </div>
  );
}
