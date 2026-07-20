/**
 * Utility for building cross-tab navigation URLs within the Optimizations page.
 * When a user clicks an entity name in one tab, this builds a URL that navigates
 * to the appropriate target tab with the entity pre-applied as a filter.
 */

export type OptimizationTab = 'container' | 'namespace' | 'node' | 'storage' | 'vm' | 'quota' | 'gpu';
export type StorageSub = 'pvc' | 'snapshot';
export type GpuSub = 'mig' | 'timeslicing';

const TAB_PREFIX_MAP: Record<string, string> = {
  container: 'ctr_',
  namespace: 'ns_',
  node: 'node_',
  pvc: 'pvc_',
  snapshot: 'snap_',
  vm: 'vm_',
  gpu_mig: 'gpu_mig_',
  gpu_ts: 'gpu_ts_',
};

export interface CrossTabNavTarget {
  tab: OptimizationTab;
  sub?: StorageSub | GpuSub;
  filterKey: string;
  filterValue: string;
}

export function buildCrossTabUrl(target: CrossTabNavTarget, basePath = '/optimizations'): string {
  const params = new URLSearchParams();
  params.set('tab', target.tab);

  if (target.sub) {
    params.set('sub', target.sub);
  }

  let prefix: string;
  if (target.tab === 'storage' && target.sub) {
    prefix = TAB_PREFIX_MAP[target.sub] ?? 'pvc_';
  } else if (target.tab === 'gpu' && target.sub) {
    prefix = TAB_PREFIX_MAP[`gpu_${target.sub === 'timeslicing' ? 'ts' : target.sub}`] ?? 'gpu_mig_';
  } else {
    prefix = TAB_PREFIX_MAP[target.tab] ?? '';
  }

  params.set(`${prefix}filter_by[${target.filterKey}]`, target.filterValue);

  return `${basePath}?${params.toString()}`;
}

export function buildSameTabFilterUrl(
  currentSearch: string,
  prefix: string,
  filterKey: string,
  filterValue: string
): string {
  const params = new URLSearchParams(currentSearch);
  params.set(`${prefix}filter_by[${filterKey}]`, filterValue);
  return `?${params.toString()}`;
}
