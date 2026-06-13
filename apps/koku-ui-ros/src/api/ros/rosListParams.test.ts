import type { RosReport } from 'api/ros/ros';
import { getRosCountCacheKey, getRosCountCacheKeyFromFetchId, withRosListProjection } from 'api/ros/rosListParams';
import { Interval, OptimizationType } from 'utils/commonTypes';

describe('withRosListProjection', () => {
  it('adds default short_term and cost params', () => {
    expect(withRosListProjection({ limit: 10 })).toEqual({
      limit: 10,
      term: Interval.short_term,
      engine: OptimizationType.cost,
    });
  });
});

describe('getRosCountCacheKey', () => {
  it('strips pagination and sort params', () => {
    const key = getRosCountCacheKey('recommendations', 'ros', 'cluster=a&engine=cost&limit=10&offset=20&order_by=last_reported&term=short_term');
    expect(key).toBe('recommendations--ros--count--cluster=a&engine=cost&term=short_term');
  });

  it('matches keys regardless of pagination differences', () => {
    const tableKey = getRosCountCacheKey('recommendations', 'ros', 'engine=cost&limit=10&term=short_term');
    const countKey = getRosCountCacheKey('recommendations', 'ros', 'engine=cost&limit=1&term=short_term');
    expect(tableKey).toBe(countKey);
  });
});

describe('getRosCountCacheKeyFromFetchId', () => {
  it('derives count key from fetch id', () => {
    const fetchId = 'recommendations--ros--engine=cost&limit=10&term=short_term';
    expect(getRosCountCacheKeyFromFetchId(fetchId)).toBe(
      'recommendations--ros--count--engine=cost&term=short_term'
    );
  });
});
