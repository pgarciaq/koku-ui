import { getMaxUtilizationPercent } from './quotaTableUtils';

describe('quotaTableUtils', () => {
  it('returns max utilization across dimensions', () => {
    expect(
      getMaxUtilizationPercent({
        cpu_request_percent: 45,
        memory_request_percent: 92,
        pods_percent: 10,
      })
    ).toBe(92);
  });

  it('returns undefined when utilization is empty', () => {
    expect(getMaxUtilizationPercent(undefined)).toBeUndefined();
    expect(getMaxUtilizationPercent({})).toBeUndefined();
  });
});
