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

/** Map an HCP sub-tab to its server-side scope selector (#694): the
 * overhead sub-tab shows management-overhead namespaces, which live outside
 * the default HCP evidence scope, so its requests must carry
 * filter[scope]=management. Hosted requests stay selector-free (default
 * scope, byte-identical contract). */
export function hcpSubToScopeParams(sub: HcpSubKey): Record<string, string> {
  return sub === 'overhead' ? { 'filter[scope]': 'management' } : {};
}

export function isGroupedHcpRow(item: { count?: number; hosted_cluster_id?: string }) {
  return item.count != null && item.count > 0;
}
