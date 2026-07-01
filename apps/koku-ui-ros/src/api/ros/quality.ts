import { axiosInstance } from 'api';

export type QualityEntityType = 'container' | 'pvc' | 'vm' | 'gpu' | 'snapshot';

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

export interface GPUMIGQualityRow {
  measured_at: string;
  cluster_uuid: string;
  cluster_alias: string;
  namespace: string;
  workload: string;
  container_name: string;
  engine: string;
  stability_pct: number | null;
  adoption_detected: boolean;
  contention_days: number | null;
  recommendation_age_hours: number | null;
}

export interface GPUMIGQualityResponse {
  meta: QualityMeta;
  links: QualityLinks;
  data: GPUMIGQualityRow[];
}

export interface SnapshotQualityRow {
  measured_at: string;
  cluster_uuid: string;
  cluster_alias: string;
  snapshot_name: string;
  adoption_detected: boolean;
  recommendation_age_hours: number | null;
}

export interface SnapshotQualityResponse {
  meta: QualityMeta;
  links: QualityLinks;
  data: SnapshotQualityRow[];
}

export function fetchGPUMIGQualityMetrics(params: Record<string, string>) {
  return axiosInstance.get<GPUMIGQualityResponse>('recommendations/openshift/quality/gpu', { params });
}

export function fetchSnapshotQualityMetrics(params: Record<string, string>) {
  return axiosInstance.get<SnapshotQualityResponse>('recommendations/openshift/quality/snapshots', { params });
}

export function getQualityCsvUrl(params: Record<string, string>, entityType: QualityEntityType = 'container'): string {
  const pathMap: Record<QualityEntityType, string> = {
    container: 'containers',
    pvc: 'pvcs',
    vm: 'vms',
    gpu: 'gpu',
    snapshot: 'snapshots',
  };
  const pathSuffix = pathMap[entityType];
  const searchParams = new URLSearchParams({ ...params, format: 'csv' });
  return `/api/cost-management/v1/recommendations/openshift/quality/${pathSuffix}?${searchParams.toString()}`;
}
