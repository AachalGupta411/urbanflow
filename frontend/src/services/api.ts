import axios, { type AxiosInstance } from 'axios';
import { getToken } from '@/utils/token';

function resolveBaseUrl(envKey: keyof ImportMetaEnv): string {
  const value = import.meta.env[envKey];
  return typeof value === 'string' ? value : '';
}

export function createApiClient(baseUrlEnvKey: keyof ImportMetaEnv): AxiosInstance {
  const client = axios.create({
    baseURL: resolveBaseUrl(baseUrlEnvKey),
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });

  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
}

export const ticketingClient = createApiClient('VITE_TICKETING_API');
export const passengerClient = createApiClient('VITE_PASSENGER_API');
export const gpsClient = createApiClient('VITE_GPS_API');
export const notificationClient = createApiClient('VITE_NOTIFICATION_API');
export const analyticsClient = createApiClient('VITE_ANALYTICS_API');
