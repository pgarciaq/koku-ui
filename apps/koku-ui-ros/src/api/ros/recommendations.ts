import { axiosInstance } from 'api';

import type { RosData, RosMeta, RosReport } from './ros';
import { RosType } from './ros';

export interface MoneyAmount {
  value?: string;
  units?: string;
}

export interface Notification {
  code?: number;
  message?: string;
  type?: string;
}

export interface RecommendationValue {
  amount?: number;
  format?: string;
}

export interface RecommendationValues {
  limits: {
    cpu?: RecommendationValue;
    memory?: RecommendationValue;
  };
  requests: {
    cpu?: RecommendationValue;
    memory?: RecommendationValue;
  };
}

export interface RecommendationEngine {
  business_hours?: RecommendationValues;
  config: RecommendationValues;
  explanation?: RecommendationExplanation;
  notifications?: {
    [key: string]: Notification;
  };
  pods_count?: number;
  variation: RecommendationValues;
}

export interface UsageValue {
  p50?: number;
  p95?: number;
  p99?: number;
  max?: number;
  format?: string;
}

export interface RecommendationTerm {
  duration_in_hours?: number;
  monitoring_start_time?: string;
  notifications?: {
    [key: string]: Notification;
  };
  plots?: {
    datapoints?: number;
    plots_data?: {
      [date: string]: {
        cpuUsage?: UsageValue;
        memoryUsage?: UsageValue;
      };
    };
  };
  recommendation_engines?: {
    cost: RecommendationEngine;
    performance: RecommendationEngine;
  };
}

export interface RecommendationTerms {
  long_term?: RecommendationTerm;
  medium_term?: RecommendationTerm;
  short_term?: RecommendationTerm;
}

export interface Recommendations {
  current?: RecommendationValues;
  estimated_monthly_savings?: MoneyAmount;
  monitoring_end_time?: string;
  /** List rows only — deduplicated codes for badge rendering */
  notification_codes?: number[];
  /** @deprecated Detail no longer aggregates at recommendations level; read engine notifications */
  notifications?: {
    [key: string]: Notification;
  };
  recommendation_terms?: RecommendationTerms;
  replicas?: {
    min?: number;
    max?: number;
    desired?: number;
    available?: number;
    avg?: number;
    source?: string;
  };
}

export interface RecommendationExplanation {
  confidence_level?: number;
  data_days?: number;
  decay_half_life_hours?: number;
  cpu_cost_percentile_millicores?: number;
  cpu_perf_percentile_millicores?: number;
  cpu_usage_p95_millicores?: number;
  cpu_usage_p50_millicores?: number;
  cpu_usage_mean_millicores?: number;
  cpu_adaptive_margin_basis_points?: number;
  cpu_trend_slope?: number;
  mem_cost_percentile_kib?: number;
  mem_perf_percentile_kib?: number;
  mem_usage_p95_kib?: number;
  mem_usage_p50_kib?: number;
  mem_usage_mean_kib?: number;
  mem_adaptive_margin_basis_points?: number;
  mem_trend_slope?: number;
  oom_count_sum?: number;
  oom_bump_applied?: boolean;
  cpu_floor_applied?: boolean;
  is_idle?: boolean;
}

export interface RecommendationReportData extends RosData {
  recommendations?: Recommendations;
}

export interface RecommendationReport extends RosReport {
  meta: RosMeta;
  data: RecommendationReportData[];
}

export const RosTypePaths: Partial<Record<RosType, string>> = {
  [RosType.ros]: 'recommendations/openshift',
};

// This fetches a recommendation by ID
export function runRosReport(reportType: RosType, query: string) {
  const path = RosTypePaths[reportType];
  const queryString = query ? `/${query}?include=explanation` : '';
  return axiosInstance.get<RecommendationReport>(`${path}${queryString}`);
}

// This fetches a recommendations list
export function runRosReports(reportType: RosType, query: string) {
  const path = RosTypePaths[reportType];
  const queryString = query ? `?${query}` : '';
  return axiosInstance.get<RecommendationReport>(`${path}${queryString}`);
}
