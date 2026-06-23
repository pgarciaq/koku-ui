import {
  formatStorageBytes,
  formatUsageRatio,
  getStorageGroupBy,
  isGroupedStorageQuery,
  termToApiKey,
} from './storageTableUtils';

describe('storageTableUtils', () => {
  it('formats bytes as GiB when large enough', () => {
    expect(formatStorageBytes(5 * 1024 ** 3)).toBe('5.0 GiB');
  });

  it('formats usage ratio as percent', () => {
    expect(formatUsageRatio(0.42)).toBe('42%');
  });

  it('maps list term to API term key', () => {
    expect(termToApiKey('short_term')).toBe('short');
    expect(termToApiKey('medium_term')).toBe('medium');
    expect(termToApiKey(undefined)).toBe('medium');
  });

  it('detects storage group_by from query', () => {
    expect(getStorageGroupBy({ group_by: { cluster: '*' } })).toBe('cluster');
    expect(getStorageGroupBy({ group_by: { project: '*' } })).toBe('project');
    expect(getStorageGroupBy({})).toBe('');
    expect(isGroupedStorageQuery({ group_by: { project: '*' } })).toBe(true);
    expect(isGroupedStorageQuery({})).toBe(false);
  });
});
