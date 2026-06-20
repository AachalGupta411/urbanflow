export interface Passenger {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  token: string;
  passenger: Passenger;
}

export type VehicleType = 'bus' | 'metro' | 'ev';
export type TicketStatus = 'active' | 'cancelled' | 'used' | 'expired';

export interface Ticket {
  id: number;
  passenger_id: number;
  route_id: string;
  vehicle_type: VehicleType;
  origin: string;
  destination: string;
  fare: number;
  status: TicketStatus;
  ticket_code: string;
  travel_date: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateTicketPayload {
  route_id: string;
  vehicle_type?: VehicleType;
  origin: string;
  destination: string;
  fare: number;
  travel_date: string;
}

export interface Vehicle {
  vehicleId: string;
  vehicleType: string;
  routeId: string;
  status: string;
  createdAt?: string;
}

export interface GpsPosition {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  recordedAt: string;
}

export interface VehicleTrackPoint {
  id: number;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  recordedAt: string;
}

export interface Notification {
  id: number;
  type: 'delay' | 'route_change' | 'system';
  title: string;
  message: string;
  route_id?: string | null;
  vehicle_id?: string | null;
  read: boolean;
  created_at: string;
}

export interface RouteAnalytics {
  route_id: string;
  ticket_count: number;
  avg_fare: number;
  utilization_pct: number;
}

export interface ApiError {
  error: string;
}
