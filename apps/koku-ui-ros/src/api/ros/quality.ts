import { axiosInstance } from 'api';

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

export function fetchQualityMetrics(params: Record<string, string>) {
  return axiosInstance.get<QualityResponse>('recommendations/openshift/quality', { params });
}

export function getQualityCsvUrl(params: Record<string, string>): string {
  const searchParams = new URLSearchParams({ ...params, format: 'csv' });
  return `/api/cost-management/v1/recommendations/openshift/quality?${searchParams.toString()}`;
}
