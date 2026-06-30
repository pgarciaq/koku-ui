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

export interface PlotData {
  datapoints?: number;
  plots_data?: {
    [date: string]: {
      cpuUsage?: UsageValue;
      memoryUsage?: UsageValue;
    };
  };
}

export interface RecommendationTerm {
  business_hours_plots?: PlotData;
  duration_in_hours?: number;
  monitoring_start_time?: string;
  notifications?: {
    [key: string]: Notification;
  };
  plots?: PlotData;
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
  cpu_savings?: MoneyAmount;
  memory_savings?: MoneyAmount;
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

function getDetailQueryParams(term?: string, engine?: string): string {
  const params = new URLSearchParams({ include: 'explanation' });
  if (term) {
    params.set('filter[term]', term);
  }
  if (engine) {
    params.set('filter[engine]', engine);
  }
  return params.toString();
}

// This fetches a recommendation by ID
export function runRosReport(reportType: RosType, id: string, term?: string, engine?: string) {
  const path = RosTypePaths[reportType];
  const queryString = id ? `/${id}?${getDetailQueryParams(term, engine)}` : '';
  return axiosInstance.get<RecommendationReport>(`${path}${queryString}`);
}

// This fetches a recommendations list
export function runRosReports(reportType: RosType, query: string) {
  const path = RosTypePaths[reportType];
  const queryString = query ? `?${query}` : '';
  return axiosInstance.get<RecommendationReport>(`${path}${queryString}`);
}

// Namespace recommendation by ID
export function runNamespaceRosReport(reportType: RosType, id: string, term?: string, engine?: string) {
  const path = RosTypePaths[reportType];
  const queryString = id ? `/namespaces/${id}?${getDetailQueryParams(term, engine)}` : '';
  return axiosInstance.get<RecommendationReport>(`${path}${queryString}`);
}

// Namespace recommendations list
export function runNamespaceRosReports(reportType: RosType, query: string) {
  const path = RosTypePaths[reportType];
  const queryString = query ? `?${query}` : '';
  return axiosInstance.get<RecommendationReport>(`${path}/namespaces${queryString}`);
}

// --- Node recommendation types ---

export interface NodeClassification {
  is_underutilized?: boolean;
  is_overcommitted?: boolean;
  idle_state?: string;
  stranded_resource?: string;
}

export interface NodeMetrics {
  cpu_util_p50?: number;
  cpu_util_p95?: number;
  mem_util_p50?: number;
  mem_util_p95?: number;
}

export interface NodeExplanation {
  confidence_level?: number;
  consolidation_applied?: boolean;
  current_cpu_millicores?: number;
  current_mem_kib?: number;
  data_days?: number;
  ema_imbalance_basis_points?: number;
  max_cpu_usage_p95_millicores?: number;
  max_mem_usage_p95_kib?: number;
  pod_scheduling_headroom_basis_points?: number;
  sizing_formula?: string;
  target_utilization_basis_points?: number;
}

export interface NodeEngineRecommendation {
  recommended_cpu_cores?: number;
  recommended_memory_gib?: number;
  node_count_reduction?: number;
  estimated_monthly_savings?: MoneyAmount;
  notifications?: Record<string, Notification>;
  updated_at?: string;
  explanation?: NodeExplanation;
}

export interface NodeRecommendationTerm {
  confidence_level?: number;
  data_days?: number;
  recommendation_engines?: {
    cost?: NodeEngineRecommendation;
    performance?: NodeEngineRecommendation;
  };
}

export interface NodeRecommendationData {
  id?: string;
  node?: string;
  cluster_uuid?: string;
  instance_type?: string;
  machineset_name?: string;
  suggested_instance_type?: string;
  instance_type_reason?: string;
  recommendation_type?: string;
  classification?: NodeClassification;
  metrics?: NodeMetrics;
  pod_count?: number;
  pod_capacity?: number;
  pod_scheduling_headroom?: number;
  cpu_overcommit_ratio?: number;
  trend_slope?: number;
  recommendation_terms?: {
    short_term?: NodeRecommendationTerm;
    medium_term?: NodeRecommendationTerm;
    long_term?: NodeRecommendationTerm;
  };
}

export interface NodeRecommendationReport {
  meta: {
    count: number;
    limit: number;
    offset: number;
    has_next?: boolean;
    next_cursor?: string;
    currency?: string;
  };
  data: NodeRecommendationData[];
  links?: Record<string, string>;
  warnings?: string[];
}

// Node recommendations list
export function runNodeRosReports(reportType: RosType, query: string) {
  const path = RosTypePaths[reportType];
  const queryString = query ? `?${query}` : '';
  return axiosInstance.get<NodeRecommendationReport>(`${path}/nodes${queryString}`);
}

// Node recommendation detail by node name
export function runNodeRosReport(reportType: RosType, id: string, term?: string, engine?: string) {
  const path = RosTypePaths[reportType];
  const queryString = id ? `/nodes/${id}?${getDetailQueryParams(term, engine)}` : '';
  return axiosInstance.get<any>(`${path}${queryString}`);
}

// --- PVC recommendation types ---

export interface PvcRecommendationData {
  capacity_bytes?: number;
  cluster_uuid?: string;
  confidence_level?: number;
  data_days?: number;
  days_to_full?: number;
  estimated_monthly_savings?: MoneyAmount;
  explanation?: PvcExplanation;
  growth_bytes_per_day?: number;
  idle_duration_days?: number;
  idle_since?: string;
  last_reported?: string;
  mounted_by?: string;
  namespace?: string;
  notifications?: Record<string, Notification>;
  persistentvolume?: string;
  persistentvolumeclaim?: string;
  recommendation_type?: string;
  recommended_bytes?: number;
  resize_note?: string;
  storageclass?: string;
  term?: string;
  usage_bytes_max?: number;
  usage_ratio?: number;
  vm_name?: string;
  count?: number;
}

export interface PvcExplanation {
  classification_reason?: string;
  confidence_level?: number;
  data_days?: number;
  growth_bytes_per_day?: number;
  min_recommended_gib?: number;
  near_full_threshold_basis_points?: number;
  oversized_threshold_basis_points?: number;
  recommended_size_multiplier?: number;
  usage_ratio?: number;
}

export interface PvcHistoricalUsagePoint {
  capacity_bytes?: number;
  date: string;
  usage_bytes_avg?: number;
  usage_bytes_max?: number;
  usage_bytes_min?: number;
}

export interface PvcRecommendationDetailResponse {
  id?: string;
  capacity_bytes?: number;
  cluster_uuid: string;
  historical_usage?: PvcHistoricalUsagePoint[];
  mounted_by?: string;
  namespace: string;
  persistentvolume?: string;
  persistentvolumeclaim: string;
  storageclass?: string;
  terms: Record<string, PvcRecommendationData>;
  vm_name?: string;
}

export interface PvcRecommendationReport {
  data: PvcRecommendationData[];
  links?: Record<string, string>;
  meta: {
    count: number;
    currency?: string;
    has_next?: boolean;
    limit: number;
    next_cursor?: string;
    offset: number;
  };
  warnings?: string[];
}

export interface PvcDetailFetchParams {
  cluster_uuid: string;
  namespace: string;
  persistentvolumeclaim: string;
  term?: string;
}

export function encodePvcDetailFetchQuery(params: PvcDetailFetchParams): string {
  const search = new URLSearchParams({
    cluster_uuid: params.cluster_uuid,
    namespace: params.namespace,
    persistentvolumeclaim: params.persistentvolumeclaim,
    include: 'explanation',
  });
  if (params.term) {
    search.set('filter[term]', params.term.replace(/_term$/, ''));
  }
  return search.toString();
}

export function decodePvcDetailFetchQuery(fetchQuery: string): PvcDetailFetchParams {
  const params = new URLSearchParams(fetchQuery);
  return {
    cluster_uuid: params.get('cluster_uuid') ?? '',
    namespace: params.get('namespace') ?? '',
    persistentvolumeclaim: params.get('persistentvolumeclaim') ?? '',
    term: params.get('filter[term]') ?? undefined,
  };
}

export function runPvcRosReports(reportType: RosType, query: string) {
  const path = RosTypePaths[reportType];
  const queryString = query ? `?${query}` : '';
  return axiosInstance.get<PvcRecommendationReport>(`${path}/pvcs${queryString}`);
}

export function runPvcRosReport(reportType: RosType, fetchQuery: string) {
  const path = RosTypePaths[reportType];
  const queryString = fetchQuery ? `?${fetchQuery}` : '';
  return axiosInstance.get<PvcRecommendationDetailResponse>(`${path}/pvcs/detail${queryString}`);
}

// --- VM recommendation types ---

export interface VmSizingBlock {
  vcpu?: number;
  memory_gib?: number;
  disk_gib?: number;
  instance_type?: string;
}

export interface VmRecommendedSizing extends VmSizingBlock {
  series?: string;
}

export interface VmRecMetadata {
  guest_agent_detected?: boolean;
  confidence?: string;
  term?: string;
  engine?: string;
  is_idle?: boolean;
  is_abandoned?: boolean;
  is_power_off_candidate?: boolean;
  power_off_idle_pct?: number;
  is_oversized?: boolean;
  is_network_bound?: boolean;
  is_redundant_placement?: boolean;
  has_shared_storage?: boolean;
  numa_oversized?: boolean;
  preference_name?: string;
  preference_class?: string;
}

export interface VmDailyDigestItem {
  bucket_date: string;
  cpu_usage_p95_mc: number;
  mem_usage_p95_kib: number;
  sample_count: number;
  cpu_usage_p50_mc?: number;
  cpu_usage_p99_mc?: number;
  cpu_usage_max_mc?: number;
  mem_usage_p50_kib?: number;
  mem_usage_p99_kib?: number;
  mem_usage_max_kib?: number;
  disk_read_iops_p95?: number | null;
  disk_write_iops_p95?: number | null;
  disk_read_bps_p95?: number | null;
  disk_write_bps_p95?: number | null;
}

export interface VmRecommendationData {
  id?: string;
  vm_name?: string;
  namespace?: string;
  cluster_uuid?: string;
  guest_os?: string;
  current?: VmSizingBlock;
  recommended?: VmRecommendedSizing;
  metadata?: VmRecMetadata;
  estimated_monthly_savings?: MoneyAmount;
  last_recommended_at?: string;
  notifications?: any[];
  daily_digests?: VmDailyDigestItem[];
}

export interface VmRecommendationReport {
  meta: {
    count: number;
    limit: number;
    offset: number;
    has_next?: boolean;
    next_cursor?: string;
    currency?: string;
  };
  data: VmRecommendationData[];
  links?: Record<string, string>;
  warnings?: string[];
}

export function runVmRosReports(reportType: RosType, query: string) {
  const path = RosTypePaths[reportType];
  const queryString = query ? `?${query}` : '';
  return axiosInstance.get<VmRecommendationReport>(`${path}/vm${queryString}`);
}

export interface VmDetailFetchParams {
  cluster_uuid: string;
  namespace: string;
  vm_name: string;
  term?: string;
  engine?: string;
}

export function encodeVmDetailFetchQuery(params: VmDetailFetchParams): string {
  const search = new URLSearchParams({
    cluster_uuid: params.cluster_uuid,
    namespace: params.namespace,
    vm_name: params.vm_name,
    include: 'explanation',
  });
  if (params.term) {
    search.set('term', params.term);
  }
  if (params.engine) {
    search.set('engine', params.engine);
  }
  return search.toString();
}

export function runVmRosReport(reportType: RosType, fetchQuery: string) {
  const path = RosTypePaths[reportType];
  const queryString = fetchQuery ? `?${fetchQuery}` : '';
  return axiosInstance.get<any>(`${path}/vm/detail${queryString}`);
}

// --- Snapshot recommendation types ---

export interface SnapshotRecommendationData {
  id?: string;
  age_days?: number;
  cluster_uuid?: string;
  creation_timestamp?: string;
  estimated_monthly_cost?: MoneyAmount;
  last_reported?: string;
  managed_by?: string;
  namespace?: string;
  notifications?: Record<string, Notification>;
  recommendation_type?: string;
  restore_size_bytes?: number;
  restored_pvc_count?: number;
  snapshot_name?: string;
  source_pvc_exists?: boolean;
  source_pvc_name?: string;
  storageclass?: string;
  volume_snapshot_class?: string;
  count?: number;
}

export interface SnapshotRecommendationReport {
  data: SnapshotRecommendationData[];
  meta: {
    count: number;
    currency?: string;
    has_next?: boolean;
    limit: number;
    next_cursor?: string;
    offset: number;
  };
}

export function runSnapshotRosReports(reportType: RosType, query: string) {
  const path = RosTypePaths[reportType];
  const queryString = query ? `?${query}` : '';
  return axiosInstance.get<SnapshotRecommendationReport>(`${path}/snapshots${queryString}`);
}

// --- Quota recommendation types ---

export interface QuotaResourceValues {
  cpu_limit_millicores?: number;
  cpu_request_millicores?: number;
  memory_limit_bytes?: number;
  memory_request_bytes?: number;
  pods?: number;
  storage_request_bytes?: number;
}

export interface QuotaUtilizationPercents {
  cpu_limit_percent?: number;
  cpu_request_percent?: number;
  memory_limit_percent?: number;
  memory_request_percent?: number;
  pods_percent?: number;
  storage_request_percent?: number;
}

export interface QuotaCapacityFreed {
  cpu_millicores?: number;
  memory_bytes?: number;
  pods_freed?: number;
  storage_request_bytes?: number;
}

export interface QuotaRecommendationData {
  id?: string;
  capacity_freed?: QuotaCapacityFreed;
  cluster_uuid?: string;
  count?: number;
  estimated_savings?: MoneyAmount;
  last_observed_at?: string;
  namespace?: string;
  notifications?: Record<string, Notification>;
  quota_hard?: QuotaResourceValues;
  quota_name?: string;
  quota_recommended?: QuotaResourceValues;
  quota_used?: QuotaResourceValues;
  recommendation_type?: string;
  risk_level?: string;
  utilization?: QuotaUtilizationPercents;
}

export interface QuotaRecommendationHistoryEntry {
  current_hard?: number;
  current_used?: number;
  recommendation_type?: string;
  recorded_at?: string;
  recommended_hard?: number;
  resource?: string;
  risk_level?: string;
  utilization_percent?: number;
}

export interface QuotaExplanationAPI {
  container_cpu_sum_millicores?: number;
  container_mem_sum_bytes?: number;
  headroom_basis_points?: number;
  max_utilization_basis_points?: number;
  recommendation_reason?: string;
  risk_level?: string;
  signal_c_cpu_used_millicores?: number;
}

export interface ClusterQuotaExplanationAPI {
  base_cpu_millicores?: number;
  headroom_basis_points?: number;
  max_utilization_basis_points?: number;
  ns_quota_cpu_sum_millicores?: number;
  ns_quota_mem_sum_bytes?: number;
  recommendation_reason?: string;
}

export interface QuotaRecommendationDetailResponse extends QuotaRecommendationData {
  explanation?: QuotaExplanationAPI;
  headroom_basis_points?: number;
  history?: QuotaRecommendationHistoryEntry[];
}

export interface QuotaRecommendationReport {
  data: QuotaRecommendationData[];
  meta: {
    count: number;
    currency?: string;
    has_next?: boolean;
    limit: number;
    next_cursor?: string;
    offset: number;
  };
}

export interface ClusterQuotaRecommendationData {
  id?: string;
  capacity_freed?: QuotaCapacityFreed;
  cluster_quota_name?: string;
  cluster_uuid?: string;
  count?: number;
  estimated_savings?: MoneyAmount;
  namespaces?: string[];
  notifications?: Record<string, Notification>;
  quota_hard?: QuotaResourceValues;
  quota_recommended?: QuotaResourceValues;
  quota_used?: QuotaResourceValues;
  recommendation_type?: string;
  risk_level?: string;
  utilization?: QuotaUtilizationPercents;
}

export interface ClusterQuotaRecommendationDetailResponse extends ClusterQuotaRecommendationData {
  explanation?: ClusterQuotaExplanationAPI;
  history?: QuotaRecommendationHistoryEntry[];
}

export interface ClusterQuotaRecommendationReport {
  data: ClusterQuotaRecommendationData[];
  meta: {
    count: number;
    currency?: string;
    has_next?: boolean;
    limit: number;
    next_cursor?: string;
    offset: number;
  };
}

export interface QuotaDetailFetchParams {
  cluster_uuid: string;
  engine?: string;
  namespace: string;
  quota_name?: string;
  term?: string;
}

export interface ClusterQuotaDetailFetchParams {
  cluster_quota_name: string;
  cluster_uuid: string;
  engine?: string;
  term?: string;
}

export function encodeQuotaDetailFetchQuery(params: QuotaDetailFetchParams): string {
  const search = new URLSearchParams({
    cluster_uuid: params.cluster_uuid,
    namespace: params.namespace,
    include: 'explanation',
  });
  const quotaName = params.quota_name?.trim();
  if (quotaName) {
    search.set('quota_name', quotaName);
  }
  if (params.term) {
    search.set('filter[term]', params.term);
  }
  if (params.engine) {
    search.set('filter[engine]', params.engine);
  }
  return search.toString();
}

export function encodeClusterQuotaDetailFetchQuery(params: ClusterQuotaDetailFetchParams): string {
  const search = new URLSearchParams({
    cluster_uuid: params.cluster_uuid,
    cluster_quota_name: params.cluster_quota_name,
    include: 'explanation',
  });
  if (params.term) {
    search.set('filter[term]', params.term);
  }
  if (params.engine) {
    search.set('filter[engine]', params.engine);
  }
  return search.toString();
}

export function runQuotaRosReports(reportType: RosType, query: string) {
  const path = RosTypePaths[reportType];
  const queryString = query ? `?${query}` : '';
  return axiosInstance.get<QuotaRecommendationReport>(`${path}/quota${queryString}`);
}

export function runQuotaRosReport(reportType: RosType, fetchQuery: string) {
  const path = RosTypePaths[reportType];
  const queryString = fetchQuery ? `?${fetchQuery}` : '';
  return axiosInstance.get<QuotaRecommendationDetailResponse>(`${path}/quota/detail${queryString}`);
}

export function runClusterQuotaRosReports(reportType: RosType, query: string) {
  const path = RosTypePaths[reportType];
  const queryString = query ? `?${query}` : '';
  return axiosInstance.get<ClusterQuotaRecommendationReport>(`${path}/cluster-quota${queryString}`);
}

export function runClusterQuotaRosReport(reportType: RosType, fetchQuery: string) {
  const path = RosTypePaths[reportType];
  const queryString = fetchQuery ? `?${fetchQuery}` : '';
  return axiosInstance.get<ClusterQuotaRecommendationDetailResponse>(`${path}/cluster-quota/detail${queryString}`);
}

// --- GPU MIG recommendation types ---

export interface GPUMIGRecommendationData {
  cluster_uuid?: string;
  namespace?: string;
  workload?: string;
  container?: string;
  term?: string;
  gpu_model?: string;
  node_name?: string;
  recommended_gpu_profile?: string;
  current_gpu_profile?: string;
  gpu_classification?: string;
  confidence?: number;
  confidence_level?: number;
  fb_usage_max_mib?: number;
  total_fb_mib?: number;
  gpu_idle_state?: string;
}

export interface GPUMIGListMeta {
  count: number;
  limit: number;
  offset: number;
  has_next?: boolean;
  next_cursor?: string;
  currency?: string;
  warnings?: string[];
}

export interface GPUMIGRecommendationReport {
  meta: GPUMIGListMeta;
  data: GPUMIGRecommendationData[];
  warnings?: string[];
}

export function runGpuMigRosReports(reportType: RosType, query: string) {
  const path = RosTypePaths[reportType];
  const queryString = query ? `?${query}` : '';
  return axiosInstance.get<GPUMIGRecommendationReport>(`${path}/gpu/mig${queryString}`);
}

// --- GPU Timeslicing recommendation types ---

export interface GPUTimeslicingRecommendationData {
  cluster_uuid?: string;
  node_name?: string;
  gpu_model?: string;
  term?: string;
  recommendation_type?: string;
  recommended_replicas?: number;
  estimated_monthly_savings?: MoneyAmount;
  savings_per_gpu?: MoneyAmount;
  classification?: string;
  confidence?: number;
  confidence_level?: number;
  candidate_containers?: Array<{
    namespace?: string;
    workload?: string;
    container?: string;
    sm_active_avg?: number;
    classification?: string;
  }>;
  notification_codes?: number[];
}

export interface GPUTimeslicingListMeta {
  count: number;
  limit: number;
  offset: number;
  has_next?: boolean;
  next_cursor?: string;
  currency?: string;
  warnings?: string[];
}

export interface GPUTimeslicingRecommendationReport {
  meta: GPUTimeslicingListMeta;
  data: GPUTimeslicingRecommendationData[];
  warnings?: string[];
}

export function runGpuTimeslicingRosReports(reportType: RosType, query: string) {
  const path = RosTypePaths[reportType];
  const queryString = query ? `?${query}` : '';
  return axiosInstance.get<GPUTimeslicingRecommendationReport>(`${path}/gpu/timeslicing${queryString}`);
}

// --- OOM Timeline types ---

export interface OomTimelineEntry {
  date: string;
  oom_kill_count: number;
}

export interface OomTimelineMeta {
  count: number;
  container_id: string;
  start_date: string;
  end_date: string;
}

export interface OomTimelineResponse {
  meta: OomTimelineMeta;
  data: OomTimelineEntry[];
}

export function fetchOomTimeline(recommendationId: string) {
  return axiosInstance.get<OomTimelineResponse>(
    `recommendations/openshift/containers/${recommendationId}/oom-timeline`
  );
}

// --- Snapshot Age Distribution types ---

export interface SnapshotAgeBucket {
  label: string;
  min_days: number;
  max_days: number | null;
  count: number;
}

export interface SnapshotAgeDistributionResponse {
  buckets: SnapshotAgeBucket[];
  total: number;
}

export function fetchSnapshotAgeDistribution(bucketBoundaries?: string) {
  const params: Record<string, string> = {};
  if (bucketBoundaries) {
    params.bucket_boundaries = bucketBoundaries;
  }
  return axiosInstance.get<SnapshotAgeDistributionResponse>(
    'recommendations/openshift/snapshots/age-distribution',
    { params }
  );
}

// --- Snapshot Cost by Type types ---

export interface SnapshotCostByTypeItem {
  recommendation_type: string;
  total_cost_cents: number;
  count: number;
}

export interface SnapshotCostByTypeResponse {
  data: SnapshotCostByTypeItem[];
}

export function fetchSnapshotCostByType() {
  return axiosInstance.get<SnapshotCostByTypeResponse>(
    'recommendations/openshift/snapshots/cost-by-type'
  );
}
