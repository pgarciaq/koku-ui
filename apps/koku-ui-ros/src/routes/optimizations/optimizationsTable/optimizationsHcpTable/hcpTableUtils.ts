import type { RosQuery } from 'api/queries/rosQuery';
import type { HcpSubKey } from 'routes/optimizations/useHcpSubUrl';

export type HcpGroupBy = '' | 'hosted_cluster_id';

export function getHcpGroupBy(query?: RosQuery): HcpGroupBy {
  if (query?.group_by?.hosted_cluster_id) {
    return 'hosted_cluster_id';
  }
  return '';
}

/** Map an HCP sub-tab to its list grouping: hosted clusters group by hosted ID, overhead shows the ungrouped list. */
export function hcpSubToGroupBy(sub: HcpSubKey): HcpGroupBy {
  return sub === 'hosted' ? 'hosted_cluster_id' : '';
}

export function isGroupedHcpRow(item: { count?: number; hosted_cluster_id?: string }) {
  return item.count != null && item.count > 0;
}
