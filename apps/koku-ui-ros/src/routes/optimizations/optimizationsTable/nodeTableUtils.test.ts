import {
  formatUtilPercentRange,
  getNodeEngineRec,
  getNodeFleetReduction,
  getNodeLastReported,
  getNodeMetricsDisplay,
} from './nodeTableUtils';

describe('nodeTableUtils', () => {
  const item = {
    node: 'worker-1',
    metrics: {
      cpu_util_p50: 0.25,
      cpu_util_p95: 0.75,
      mem_util_p50: 0.4,
      mem_util_p95: 0.8,
    },
    recommendation_terms: {
      short_term: {
        recommendation_engines: {
          cost: {
            node_count_reduction: 2,
            updated_at: '2026-06-22T12:00:00Z',
          },
        },
      },
    },
  };

  it('formats utilization percent ranges', () => {
    expect(formatUtilPercentRange(0.25, 0.75)).toBe('25.0% / 75.0%');
    expect(formatUtilPercentRange(undefined, undefined)).toBe('—');
    expect(formatUtilPercentRange(0.5, undefined)).toBe('50.0% / —');
  });

  it('reads projection-specific engine fields', () => {
    expect(getNodeEngineRec(item, 'short_term', 'cost')?.node_count_reduction).toBe(2);
    expect(getNodeFleetReduction(item, 'short_term', 'cost')).toBe(2);
    expect(getNodeFleetReduction({ ...item, recommendation_terms: { short_term: { recommendation_engines: { cost: { node_count_reduction: 0 } } } } }, 'short_term', 'cost')).toBe(0);
    expect(getNodeFleetReduction(item, 'medium_term', 'cost')).toBeUndefined();
    expect(getNodeLastReported(item, 'short_term', 'cost')).toBe('2026-06-22T12:00:00Z');
  });

  it('builds metrics display strings', () => {
    expect(getNodeMetricsDisplay(item.metrics)).toEqual({
      cpu: '25.0% / 75.0%',
      memory: '40.0% / 80.0%',
    });
  });
});
