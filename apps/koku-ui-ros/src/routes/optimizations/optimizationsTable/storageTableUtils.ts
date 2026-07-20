import type { RosQuery } from 'api/queries/rosQuery';
import type { PvcRecommendationData } from 'api/ros/recommendations';

export type StorageGroupBy = '' | 'cluster' | 'project';

export function getStorageGroupBy(query?: RosQuery): StorageGroupBy {
  if (query?.group_by?.cluster) {
    return 'cluster';
  }
  if (query?.group_by?.project) {
    return 'project';
  }
  return '';
}

export function isGroupedStorageQuery(query?: RosQuery): boolean {
  return getStorageGroupBy(query) !== '';
}

export function isGroupedStorageRow(item: { count?: number }): boolean {
  return item.count != null && item.count > 0;
}

export function formatStorageBytes(bytes?: number): string {
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

export function formatUsageRatio(ratio?: number): string {
  if (ratio == null) {
    return '—';
  }
  return `${Math.round(ratio * 100)}%`;
}

export function formatMoneyCell(value?: { value?: string; units?: string }): string | null {
  if (value?.value == null || value.value === '' || Number(value.value) === 0) {
    return null;
  }
  return `$${Number(value.value).toFixed(2)} ${value.units ?? 'USD'}`;
}

export function getPvcRowKey(item: PvcRecommendationData): string {
  return `${item.cluster_uuid}:${item.namespace}:${item.persistentvolumeclaim}`;
}

/** Map list URL term (short_term) to API detail terms key (short). */
export function termToApiKey(term?: string): string {
  if (!term) {
    return 'medium';
  }
  return term.replace(/_term$/, '');
}
