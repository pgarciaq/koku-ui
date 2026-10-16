import type { RosQuery } from 'api/queries/rosQuery';
import type { HcpSubKey } from 'routes/optimizations/useHcpSubUrl';

export type HcpGroupBy = '' | 'hosted_cluster_id';

export function getHcpGroupBy(query?: RosQuery): HcpGroupBy {
  if (query?.group_by?.hosted_cluster_id) {
    return 'hosted_cluster_id';
  }
  return '';
}

/** Map an HCP sub-tab to its list grouping. Both sub-tabs show the flat
 * ungrouped list (grouped-namespace arrives with #690); the Hosted sub adds
 * the summary strip instead of a grouped table. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- sub selects the branch once #690 adds namespace grouping
export function hcpSubToGroupBy(sub: HcpSubKey): HcpGroupBy {
  return '';
}

export function isGroupedHcpRow(item: { count?: number; hosted_cluster_id?: string }) {
  return item.count != null && item.count > 0;
}
