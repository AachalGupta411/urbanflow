import { analyticsClient } from './api';
import type { AnalyticsPassengers, AnalyticsRoutes, AnalyticsTickets } from '@/types';

export async function getPassengerAnalytics(): Promise<AnalyticsPassengers> {
  const { data } = await analyticsClient.get<AnalyticsPassengers>('/api/analytics/passengers');
  return data;
}

export async function getTicketAnalytics(): Promise<AnalyticsTickets> {
  const { data } = await analyticsClient.get<AnalyticsTickets>('/api/analytics/tickets');
  return data;
}

export async function getRouteAnalytics(): Promise<AnalyticsRoutes> {
  const { data } = await analyticsClient.get<AnalyticsRoutes>('/api/analytics/routes');
  return data;
}
