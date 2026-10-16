import type { RosQuery } from 'api/queries/rosQuery';
import type { HcpSubKey } from 'routes/optimizations/useHcpSubUrl';

export type HcpGroupBy = '' | 'hosted_cluster_id' | 'namespace';

export function getHcpGroupBy(query?: RosQuery): HcpGroupBy {
  if (query?.group_by?.hosted_cluster_id) {
    return 'hosted_cluster_id';
  }
  if (query?.group_by?.namespace) {
    return 'namespace';
  }
  return '';
}

/** Map an HCP sub-tab to its list grouping: hosted is flat (the summary
 * strip carries per-HC totals), overhead groups by namespace (#690). */
export function hcpSubToGroupBy(sub: HcpSubKey): HcpGroupBy {
  return sub === 'overhead' ? 'namespace' : '';
}

export function isGroupedHcpRow(item: { count?: number; hosted_cluster_id?: string }) {
  return item.count != null && item.count > 0;
}
