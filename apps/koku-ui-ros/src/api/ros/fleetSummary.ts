import { axiosInstance } from 'api';

import type { MoneyAmount } from './recommendations';

export interface FleetSummaryResponse {
  total_containers?: number;
  active_containers?: number;
  idle_containers?: number;
  abandoned_containers?: number;
  total_monthly_savings?: MoneyAmount;
  cluster_count?: number;
  currency?: string;
}

export function fetchFleetSummary() {
  return axiosInstance.get<FleetSummaryResponse>('/recommendations/openshift/fleet-summary');
}
