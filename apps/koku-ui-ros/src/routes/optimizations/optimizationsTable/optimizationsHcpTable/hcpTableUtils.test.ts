import { getHcpGroupBy, hcpSubToGroupBy, hcpSubToScopeParams, isGroupedHcpRow } from './hcpTableUtils';

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

    test('returns namespace when grouped by namespace', () => {
      expect(getHcpGroupBy({ group_by: { namespace: '*' } })).toBe('namespace');
    });
  });

  describe('hcpSubToScopeParams (#694)', () => {
    test('overhead sub requests the management scope', () => {
      expect(hcpSubToScopeParams('overhead')).toEqual({ 'filter[scope]': 'management' });
    });

    test('hosted sub carries no scope selector (default HCP scope unchanged)', () => {
      expect(hcpSubToScopeParams('hosted')).toEqual({});
    });
  });

  describe('isGroupedHcpRow', () => {
    test('detects grouped rows by count', () => {
      expect(isGroupedHcpRow({ count: 2, hosted_cluster_id: 'hc-1' })).toBe(true);
      expect(isGroupedHcpRow({ hosted_cluster_id: 'hc-1' })).toBe(false);
      expect(isGroupedHcpRow({ count: 0 })).toBe(false);
    });
  });

  describe('hcpSubToGroupBy', () => {
    test('hosted sub shows the flat list (strip carries per-HC totals)', () => {
      expect(hcpSubToGroupBy('hosted')).toBe('');
    });

    test('overhead sub groups by namespace', () => {
      expect(hcpSubToGroupBy('overhead')).toBe('namespace');
    });
  });
});
