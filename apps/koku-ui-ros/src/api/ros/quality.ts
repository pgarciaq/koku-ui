import { axiosInstance } from 'api';

export type QualityEntityType = 'container' | 'pvc' | 'vm';

export interface QualityRow {
  measured_at: string;
  cluster_uuid: string;
  cluster_alias: string;
  namespace: string;
  workload: string;
  container_name: string;
  engine: string;
  stability_pct: number | null;
  adoption_detected: boolean;
  oom_events_after_rec: number | null;
  recommendation_age_hours: number | null;
}

export interface PVCQualityRow {
  measured_at: string;
  cluster_uuid: string;
  cluster_alias: string;
  namespace: string;
  pvc_name: string;
  engine: string;
  stability_pct: number | null;
  adoption_detected: boolean;
  days_above_threshold: number | null;
  recommendation_age_hours: number | null;
}

export interface VMQualityRow {
  measured_at: string;
  cluster_uuid: string;
  cluster_alias: string;
  namespace: string;
  vm_name: string;
  engine: string;
  stability_pct: number | null;
  adoption_detected: boolean;
  saturation_days: number | null;
  recommendation_age_hours: number | null;
}

export interface QualityMeta {
  count: number;
  limit: number;
  offset: number;
}

export interface QualityLinks {
  first: string;
  last: string;
  next: string | null;
  previous: string | null;
}

export interface QualityResponse {
  meta: QualityMeta;
  links: QualityLinks;
  data: QualityRow[];
}

export interface PVCQualityResponse {
  meta: QualityMeta;
  links: QualityLinks;
  data: PVCQualityRow[];
}

export interface VMQualityResponse {
  meta: QualityMeta;
  links: QualityLinks;
  data: VMQualityRow[];
}

export function fetchQualityMetrics(params: Record<string, string>) {
  return axiosInstance.get<QualityResponse>('recommendations/openshift/quality/containers', { params });
}

export function fetchPVCQualityMetrics(params: Record<string, string>) {
  return axiosInstance.get<PVCQualityResponse>('recommendations/openshift/quality/pvcs', { params });
}

export function fetchVMQualityMetrics(params: Record<string, string>) {
  return axiosInstance.get<VMQualityResponse>('recommendations/openshift/quality/vms', { params });
}

export function getQualityCsvUrl(params: Record<string, string>, entityType: QualityEntityType = 'container'): string {
  const pathSuffix = entityType === 'container' ? 'containers' : entityType === 'pvc' ? 'pvcs' : 'vms';
  const searchParams = new URLSearchParams({ ...params, format: 'csv' });
  return `/api/cost-management/v1/recommendations/openshift/quality/${pathSuffix}?${searchParams.toString()}`;
}
