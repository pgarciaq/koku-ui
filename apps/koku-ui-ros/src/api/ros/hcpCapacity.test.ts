import { axiosInstance } from 'api';

import { fetchHcpCapacityHistory, fetchHcpCapacityLatest, formatHeadroom, getScenarioByName, isScenarioUnavailable } from './hcpCapacity';

describe('hcpCapacity api', () => {
  it('fetches the unfiltered latest card list', () => {
    fetchHcpCapacityLatest();
    expect(axiosInstance.get).toHaveBeenCalledWith('recommendations/openshift/hcp/fleet-capacity');
  });

  it('fetches the filtered latest for one cluster', () => {
    fetchHcpCapacityLatest('11111111-1111-1111-1111-111111111111');
    expect(axiosInstance.get).toHaveBeenCalledWith(
      'recommendations/openshift/hcp/fleet-capacity?filter%5Bcluster_uuid%5D=11111111-1111-1111-1111-111111111111'
    );
  });

  it('fetches history with required cluster and pagination', () => {
    fetchHcpCapacityHistory('11111111-1111-1111-1111-111111111111', 20, 40);
    expect(axiosInstance.get).toHaveBeenCalledWith(
      'recommendations/openshift/hcp/fleet-capacity/history?filter%5Bcluster_uuid%5D=11111111-1111-1111-1111-111111111111&limit=20&offset=40'
    );
  });
});

describe('hcpCapacity helpers', () => {
  const row = {
    cluster_uuid: 'c',
    scenarios: [
      { name: 'request', max_hcs: 7, limiting_resource: 'memory_request', headroom: 3, status: 'ok' },
      { name: 'average_qps', max_hcs: 0, limiting_resource: '', headroom: null, status: 'ok' },
      { name: 'high_qps', max_hcs: 3, limiting_resource: 'cpu_usage', headroom: -1, status: 'ok' },
    ],
  };

  it('finds scenarios by name and reports missing ones', () => {
    expect(getScenarioByName(row, 'request')?.max_hcs).toBe(7);
    expect(getScenarioByName(row, 'low_qps')).toBeUndefined();
  });

  it('treats an empty limiting resource as unavailable, never zero-filled', () => {
    expect(isScenarioUnavailable(getScenarioByName(row, 'average_qps'))).toBe(true);
    // A genuine zero maximum still carries a limiting resource (zero-worker
    // fleet) and is a value, not an absence.
    expect(isScenarioUnavailable({ name: 'request', max_hcs: 0, limiting_resource: 'pods', headroom: null, status: 'ok' })).toBe(false);
  });

  it('formats signed headroom and never computes it locally', () => {
    expect(formatHeadroom(3)).toBe('+3');
    expect(formatHeadroom(-1)).toBe('-1');
    // Null (unknown or withheld under pressure) stays null: the panel must
    // not derive max - current itself.
    expect(formatHeadroom(null)).toBeNull();
  });
});
