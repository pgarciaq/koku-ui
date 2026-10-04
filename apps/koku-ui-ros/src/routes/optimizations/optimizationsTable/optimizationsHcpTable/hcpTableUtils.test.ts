import { getHcpGroupBy, isGroupedHcpRow } from './hcpTableUtils';

describe('hcpTableUtils', () => {
  describe('getHcpGroupBy', () => {
    test('returns hosted_cluster_id when grouped', () => {
      expect(getHcpGroupBy({ group_by: { hosted_cluster_id: '*' } })).toBe('hosted_cluster_id');
    });

    test('returns empty when ungrouped', () => {
      expect(getHcpGroupBy({})).toBe('');
      expect(getHcpGroupBy(undefined)).toBe('');
      expect(getHcpGroupBy({ group_by: { cluster: '*' } })).toBe('');
    });
  });

  describe('isGroupedHcpRow', () => {
    test('detects grouped rows by count', () => {
      expect(isGroupedHcpRow({ count: 2, hosted_cluster_id: 'hc-1' })).toBe(true);
      expect(isGroupedHcpRow({ hosted_cluster_id: 'hc-1' })).toBe(false);
      expect(isGroupedHcpRow({ count: 0 })).toBe(false);
    });
  });
});
