import type { QuotaRecommendationHistoryEntry } from 'api/ros/recommendations';

import {
  formatRecordedAt,
  getChartYAxisLabel,
  groupHistoryByResource,
  isQuotaHistoryResource,
  toChartValue,
} from './quotaHistoryUtils';

describe('quotaHistoryUtils', () => {
  const sampleHistory: QuotaRecommendationHistoryEntry[] = [
    {
      current_hard: 4000,
      current_used: 2000,
      recorded_at: '2026-05-01T00:00:00Z',
      recommended_hard: 3000,
      resource: 'cpu_request',
      utilization_percent: 50,
    },
    {
      current_hard: 4000,
      current_used: 3000,
      recorded_at: '2026-05-15T00:00:00Z',
      recommended_hard: 3500,
      resource: 'cpu_request',
      utilization_percent: 75,
    },
    {
      current_hard: 1073741824,
      current_used: 536870912,
      recorded_at: '2026-05-01T00:00:00Z',
      recommended_hard: 805306368,
      resource: 'memory_request',
      utilization_percent: 50,
    },
  ];

  it('groups history entries by resource in chronological order', () => {
    const grouped = groupHistoryByResource(sampleHistory);

    expect(grouped.size).toBe(2);
    expect(isQuotaHistoryResource('cpu_request')).toBe(true);
    expect(grouped.get('cpu_request')?.map(entry => entry.recorded_at)).toEqual([
      '2026-05-01T00:00:00Z',
      '2026-05-15T00:00:00Z',
    ]);
  });

  it('converts resource values for chart display', () => {
    expect(toChartValue('cpu_request', 4000)).toBe(4);
    expect(toChartValue('memory_request', 1073741824)).toBe(1);
    expect(toChartValue('pods', 10)).toBe(10);
    expect(getChartYAxisLabel('cpu_request')).toBe('cores');
    expect(getChartYAxisLabel('storage_request')).toBe('GiB');
  });

  it('formats recorded_at for chart axis labels', () => {
    const formatted = formatRecordedAt('2026-05-01T00:00:00Z');
    expect(formatted).toMatch(/May/);
    expect(formatted).toMatch(/1/);
  });
});
