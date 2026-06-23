import { buildStoragePvcListParams } from './storageNavigation';

describe('storageNavigation', () => {
  it('builds storage PVC sub-view params with filters', () => {
    const params = buildStoragePvcListParams('tab=node&snap_filter_by[cluster]=old', {
      cluster: 'cluster-a',
      project: 'apps',
      pvc_name: 'data-pvc',
    });

    expect(params.get('tab')).toBe('storage');
    expect(params.get('sub')).toBe('pvc');
    expect(params.get('pvc_filter_by[cluster]')).toBe('cluster-a');
    expect(params.get('pvc_filter_by[project]')).toBe('apps');
    expect(params.get('pvc_filter_by[pvc_name]')).toBe('data-pvc');
    expect(params.get('snap_filter_by[cluster]')).toBe('old');
  });
});
