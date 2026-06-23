import type { RosQuery } from 'api/queries/rosQuery';
import type { QuotaUtilizationPercents } from 'api/ros/recommendations';

export type QuotaGroupBy = '' | 'cluster' | 'project';

export function getQuotaGroupBy(query?: RosQuery): QuotaGroupBy {
  if (query?.group_by?.cluster) {
    return 'cluster';
  }
  if (query?.group_by?.project) {
    return 'project';
  }
  return '';
}

export function formatMoneyCell(value?: { value?: string; units?: string }): string | null {
  if (value?.value == null || value.value === '' || Number(value.value) === 0) {
    return null;
  }
  return `$${Number(value.value).toFixed(2)} ${value.units ?? 'USD'}`;
}

export function formatCpuMillicores(millicores?: number): string {
  if (millicores == null) {
    return '—';
  }
  if (millicores >= 1000) {
    return `${(millicores / 1000).toFixed(1)} cores`;
  }
  return `${millicores} m`;
}

export function formatMemoryBytes(bytes?: number): string {
  if (bytes == null) {
    return '—';
  }
  const gib = bytes / 1024 ** 3;
  if (gib >= 1) {
    return `${gib.toFixed(1)} GiB`;
  }
  const mib = bytes / 1024 ** 2;
  if (mib >= 1) {
    return `${mib.toFixed(1)} MiB`;
  }
  return `${Math.round(bytes / 1024)} KiB`;
}

/** Highest utilization percent across quota resource dimensions. */
export function getMaxUtilizationPercent(utilization?: QuotaUtilizationPercents): number | undefined {
  if (!utilization) {
    return undefined;
  }
  const values = [
    utilization.cpu_request_percent,
    utilization.cpu_limit_percent,
    utilization.memory_request_percent,
    utilization.memory_limit_percent,
    utilization.storage_request_percent,
    utilization.pods_percent,
  ].filter((v): v is number => v != null);
  if (values.length === 0) {
    return undefined;
  }
  return Math.max(...values);
}

export function formatUtilizationPercent(utilization?: QuotaUtilizationPercents): string {
  const max = getMaxUtilizationPercent(utilization);
  if (max == null) {
    return '—';
  }
  return `${Math.round(max)}%`;
}

export type QuotaRecommendationType = 'tighten' | 'raise' | 'optimal' | 'none';

export type QuotaRiskLevel = 'high' | 'medium' | 'low' | 'none';
