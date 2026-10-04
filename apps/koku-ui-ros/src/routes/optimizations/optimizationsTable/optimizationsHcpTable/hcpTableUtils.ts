import type { RosQuery } from 'api/queries/rosQuery';

export type HcpGroupBy = '' | 'hosted_cluster_id';

export function getHcpGroupBy(query?: RosQuery): HcpGroupBy {
  if (query?.group_by?.hosted_cluster_id) {
    return 'hosted_cluster_id';
  }
  return '';
}

export function isGroupedHcpRow(item: { count?: number; hosted_cluster_id?: string }) {
  return item.count != null && item.count > 0;
}
