import { axiosInstance } from 'api';

export interface HistoryRow {
  recorded_at: string;
  cluster_uuid: string;
  cluster_alias: string;
  namespace: string;
  workload: string;
  container_name: string;
  term: 'short_term' | 'medium_term' | 'long_term';
  engine: 'cost' | 'performance';
  rec_cpu_request_millicores: number | null;
  rec_cpu_limit_millicores: number | null;
  rec_memory_request_kib: number | null;
  rec_memory_limit_kib: number | null;
  notification_codes: number[] | null;
  confidence_level: number | null;
  estimated_monthly_savings?: { value: number; units: string } | null;
  expl_data_days?: number | null;
  expl_decay_half_life_hours?: number | null;
  expl_cpu_cost_pct_mc?: number | null;
  expl_cpu_perf_pct_mc?: number | null;
  expl_cpu_usage_p95_mc?: number | null;
  expl_cpu_usage_p50_mc?: number | null;
  expl_cpu_usage_mean_mc?: number | null;
  expl_cpu_adaptive_margin_bp?: number | null;
  expl_cpu_trend_slope?: number | null;
  expl_mem_cost_pct_kib?: number | null;
  expl_mem_perf_pct_kib?: number | null;
  expl_mem_usage_p95_kib?: number | null;
  expl_mem_usage_p50_kib?: number | null;
  expl_mem_usage_mean_kib?: number | null;
  expl_mem_adaptive_margin_bp?: number | null;
  expl_mem_trend_slope?: number | null;
  expl_oom_count_sum?: number | null;
  expl_oom_bump_applied?: boolean | null;
  expl_cpu_floor_applied?: boolean | null;
  expl_mem_floor_applied?: boolean | null;
  expl_is_idle?: boolean | null;
}

export interface HistoryListMeta {
  count: number;
  limit: number;
  offset: number;
}

export interface HistoryListResponse {
  meta: HistoryListMeta;
  data: HistoryRow[];
}

export interface RecommendationHistoryParams {
  cluster?: string;
  project?: string;
  workload?: string;
  container?: string;
  term?: string;
  engine?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
  order_by?: string;
  order_how?: string;
}

export function fetchRecommendationHistory(params: RecommendationHistoryParams) {
  const queryParams: Record<string, string> = {};

  if (params.cluster) {
    queryParams['filter[cluster]'] = params.cluster;
  }
  if (params.project) {
    queryParams['filter[project]'] = params.project;
  }
  if (params.workload) {
    queryParams['filter[workload]'] = params.workload;
  }
  if (params.container) {
    queryParams['filter[container]'] = params.container;
  }
  if (params.term) {
    queryParams['filter[term]'] = params.term;
  }
  if (params.engine) {
    queryParams['filter[engine]'] = params.engine;
  }
  if (params.start_date) {
    queryParams.start_date = params.start_date;
  }
  if (params.end_date) {
    queryParams.end_date = params.end_date;
  }
  if (params.limit) {
    queryParams.limit = String(params.limit);
  }
  if (params.offset) {
    queryParams.offset = String(params.offset);
  }
  if (params.order_by) {
    queryParams.order_by = params.order_by;
  }
  if (params.order_how) {
    queryParams.order_how = params.order_how;
  }

  return axiosInstance.get<HistoryListResponse>('/recommendations/openshift/history', {
    params: queryParams,
  });
}
