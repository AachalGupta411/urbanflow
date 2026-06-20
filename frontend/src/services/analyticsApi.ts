import { analyticsClient } from './api';
import type {
  PassengerAnalyticsResponse,
  RouteAnalyticsResponse,
  TicketAnalyticsResponse,
} from '@/utils/analyticsTransform';

export async function getPassengerAnalytics(): Promise<PassengerAnalyticsResponse> {
  const { data } = await analyticsClient.get<PassengerAnalyticsResponse>('/api/analytics/passengers');
  return data;
}

export async function getTicketAnalytics(): Promise<TicketAnalyticsResponse> {
  const { data } = await analyticsClient.get<TicketAnalyticsResponse>('/api/analytics/tickets');
  return data;
}

export async function getRouteAnalytics(): Promise<RouteAnalyticsResponse> {
  const { data } = await analyticsClient.get<RouteAnalyticsResponse>('/api/analytics/routes');
  return data;
}
