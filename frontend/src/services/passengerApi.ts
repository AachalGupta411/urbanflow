import { passengerClient } from './api';
import type { AuthResponse, Passenger } from '@/types';

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await passengerClient.post<AuthResponse>('/api/passengers/register', payload);
  return data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await passengerClient.post<AuthResponse>('/api/passengers/login', payload);
  return data;
}

export async function getProfile(): Promise<Passenger> {
  const { data } = await passengerClient.get<{ passenger: Passenger }>('/api/passengers/profile');
  return data.passenger;
}

export async function updateProfile(payload: { full_name: string; phone?: string }): Promise<Passenger> {
  const { data } = await passengerClient.put<{ passenger: Passenger }>('/api/passengers/profile', payload);
  return data.passenger;
}
