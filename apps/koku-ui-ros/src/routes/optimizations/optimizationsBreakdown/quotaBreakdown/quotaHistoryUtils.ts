import type { QuotaRecommendationHistoryEntry } from 'api/ros/recommendations';

export const QUOTA_HISTORY_RESOURCES = ['cpu_request', 'memory_request', 'storage_request', 'pods'] as const;

export type QuotaHistoryResource = (typeof QUOTA_HISTORY_RESOURCES)[number];

export function isQuotaHistoryResource(resource?: string): resource is QuotaHistoryResource {
  return QUOTA_HISTORY_RESOURCES.includes(resource as QuotaHistoryResource);
}

export function groupHistoryByResource(
  history?: QuotaRecommendationHistoryEntry[]
): Map<QuotaHistoryResource, QuotaRecommendationHistoryEntry[]> {
  const grouped = new Map<QuotaHistoryResource, QuotaRecommendationHistoryEntry[]>();

  if (!history?.length) {
    return grouped;
  }

  const sorted = [...history].sort((a, b) => {
    const aTime = a.recorded_at ? Date.parse(a.recorded_at) : 0;
    const bTime = b.recorded_at ? Date.parse(b.recorded_at) : 0;
    return aTime - bTime;
  });

  sorted.forEach(entry => {
    if (!isQuotaHistoryResource(entry.resource)) {
      return;
    }
    const existing = grouped.get(entry.resource) ?? [];
    existing.push(entry);
    grouped.set(entry.resource, existing);
  });

  return grouped;
}

/** Convert raw API values to chart-friendly numbers for a given resource dimension. */
export function toChartValue(resource: QuotaHistoryResource, value?: number): number | null {
  if (value == null) {
    return null;
  }
  switch (resource) {
    case 'cpu_request':
      return value / 1000;
    case 'memory_request':
    case 'storage_request':
      return value / 1024 ** 3;
    case 'pods':
      return value;
    default:
      return value;
  }
}

export function getChartYAxisLabel(resource: QuotaHistoryResource): string {
  switch (resource) {
    case 'cpu_request':
      return 'cores';
    case 'memory_request':
    case 'storage_request':
      return 'GiB';
    case 'pods':
      return 'pods';
    default:
      return '';
  }
}

export function formatChartTooltipValue(resource: QuotaHistoryResource, value?: number): string {
  if (value == null) {
    return '—';
  }
  const chartValue = toChartValue(resource, value);
  if (chartValue == null) {
    return '—';
  }
  switch (resource) {
    case 'cpu_request':
      return `${chartValue.toFixed(2)} cores`;
    case 'memory_request':
    case 'storage_request':
      return `${chartValue.toFixed(2)} GiB`;
    case 'pods':
      return String(Math.round(chartValue));
    default:
      return String(chartValue);
  }
}

export function formatRecordedAt(recordedAt?: string): string {
  if (!recordedAt) {
    return '';
  }
  const date = new Date(recordedAt);
  if (Number.isNaN(date.getTime())) {
    return recordedAt;
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
