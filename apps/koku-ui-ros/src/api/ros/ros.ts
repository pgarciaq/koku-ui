import type { PagedMetaData, PagedResponse } from 'api/api';

export interface RosIdleRecommendation {
  action?: string;
  confidence?: string;
  reason?: string;
}

export type RecommendationCategory = 'undersized' | 'oversized' | 'optimized';

export interface RosData {
  analytics_incomplete?: boolean;
  category?: RecommendationCategory;
  category_cpu?: RecommendationCategory;
  category_memory?: RecommendationCategory;
  cluster_uuid?: string;
  cluster_alias?: string;
  container?: string;
  estimated_monthly_waste?: { value?: string; units?: string };
  id?: string;
  idle_duration_days?: number;
  idle_recommendation?: RosIdleRecommendation;
  idle_since?: string;
  idle_state?: string;
  ingest_hooks_failed?: boolean;
  last_reported?: string;
  project?: string;
  recommendations?: any;
  source_id?: string;
  tags?: Record<string, string>;
  workload?: string;
  workload_type?: string;
}

export interface RosMeta extends PagedMetaData {
  count: number;
  currency?: string;
  has_next?: boolean;
  limit?: number;
  next_cursor?: string;
  offset?: number;
}

export const enum RosNamespace {
  containers = 'containers',
  nodes = 'nodes',
  projects = 'projects',
}

export type RosReport = PagedResponse<RosData, RosMeta>;

export const enum RosType {
  ros = 'ros',
}

export const enum RosPathsType {
  namespaceRecommendation = 'namespaceRecommendation',
  namespaceRecommendations = 'namespaceRecommendations',
  nodeRecommendation = 'nodeRecommendation',
  nodeRecommendations = 'nodeRecommendations',
  pvcRecommendation = 'pvcRecommendation',
  pvcRecommendations = 'pvcRecommendations',
  recommendation = 'recommendation',
  recommendations = 'recommendations',
  snapshotRecommendations = 'snapshotRecommendations',
  quotaRecommendations = 'quotaRecommendations',
  clusterQuotaRecommendations = 'clusterQuotaRecommendations',
  quotaRecommendation = 'quotaRecommendation',
  clusterQuotaRecommendation = 'clusterQuotaRecommendation',
  vmRecommendation = 'vmRecommendation',
  vmRecommendations = 'vmRecommendations',
  gpuMigRecommendations = 'gpuMigRecommendations',
  gpuTimeslicingRecommendations = 'gpuTimeslicingRecommendations',
}
