import { Bus, MapPin, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { VehicleType } from '@/types';

export interface FleetVehicle {
  id: string;
  type: VehicleType | string;
  routeId: string;
  status: 'active' | 'idle' | 'maintenance' | 'delayed';
  speed: number;
  latitude?: number;
  longitude?: number;
  lastUpdate?: string;
}

interface FleetCardProps {
  vehicle: FleetVehicle;
  onSelect?: (id: string) => void;
  selected?: boolean;
}

const typeIcons: Record<string, typeof Bus> = {
  bus: Bus,
  metro: Zap,
  ev: Zap,
};

const statusVariant: Record<FleetVehicle['status'], 'success' | 'warning' | 'danger' | 'muted'> = {
  active: 'success',
  idle: 'muted',
  maintenance: 'warning',
  delayed: 'danger',
};

export default function FleetCard({ vehicle, onSelect, selected }: FleetCardProps) {
  const Icon = typeIcons[vehicle.type] ?? Bus;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(vehicle.id)}
      className={cn(
        'glass-panel w-full animate-slide-in rounded-xl p-4 text-left transition-all duration-200',
        'hover:border-primary/40 hover:shadow-glow',
        selected && 'border-primary/50 ring-1 ring-primary/30'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/15 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{vehicle.id}</p>
            <p className="text-xs capitalize text-muted-foreground">{vehicle.type} · {vehicle.routeId}</p>
          </div>
        </div>
        <Badge variant={statusVariant[vehicle.status]}>{vehicle.status}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-muted-foreground">Speed</p>
          <p className="font-medium text-foreground">{vehicle.speed.toFixed(0)} km/h</p>
        </div>
        <div>
          <p className="text-muted-foreground">Last ping</p>
          <p className="font-medium text-foreground">
            {vehicle.lastUpdate
              ? new Date(vehicle.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '—'}
          </p>
        </div>
      </div>

      {vehicle.latitude !== undefined && vehicle.longitude !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}
        </div>
      )}
    </button>
  );
}
