export interface StoragePvcListFilters {
  cluster?: string;
  project?: string;
  pvc_name?: string;
}

/** Build search params for Storage tab PVC sub-view with optional filters. */
export function buildStoragePvcListParams(
  currentSearch: string,
  filters: StoragePvcListFilters = {}
): URLSearchParams {
  const params = new URLSearchParams(currentSearch);
  params.set('tab', 'storage');
  params.set('sub', 'pvc');

  for (const key of ['cluster', 'project', 'pvc_name', 'classification'] as const) {
    params.delete(`pvc_filter_by[${key}]`);
  }

  if (filters.cluster) {
    params.set('pvc_filter_by[cluster]', filters.cluster);
  }
  if (filters.project) {
    params.set('pvc_filter_by[project]', filters.project);
  }
  if (filters.pvc_name) {
    params.set('pvc_filter_by[pvc_name]', filters.pvc_name);
  }

  params.delete('pvc_offset');
  params.delete('pvc_after');

  return params;
}

export function buildStoragePvcListPath(pathname: string, currentSearch: string, filters: StoragePvcListFilters = {}) {
  const params = buildStoragePvcListParams(currentSearch, filters);
  return `${pathname}?${params.toString()}`;
}
