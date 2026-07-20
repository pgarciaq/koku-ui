import {
  decodeRosDetailFetchQuery,
  encodeRosDetailFetchQuery,
  getRosCountCacheKey,
  getRosCountCacheKeyFromFetchId,
  withRosListProjection,
} from 'api/ros/rosListParams';
import { Interval, OptimizationType } from 'utils/commonTypes';

describe('withRosListProjection', () => {
  it('adds default short_term and cost params', () => {
    expect(withRosListProjection({ limit: 10 })).toEqual({
      limit: 10,
      term: Interval.short_term,
      engine: OptimizationType.cost,
    });
  });

  it('preserves query term and engine when provided', () => {
    expect(
      withRosListProjection({
        limit: 10,
        term: Interval.medium_term,
        engine: OptimizationType.performance,
      })
    ).toEqual({
      limit: 10,
      term: Interval.medium_term,
      engine: OptimizationType.performance,
    });
  });
});

describe('encodeRosDetailFetchQuery', () => {
  it('returns id only when no projection is set', () => {
    expect(encodeRosDetailFetchQuery({ id: 'abc-123' })).toBe('abc-123');
  });

  it('encodes filter params for detail fetch cache keys', () => {
    expect(
      encodeRosDetailFetchQuery({
        id: 'abc-123',
        term: Interval.short_term,
        engine: OptimizationType.cost,
      })
    ).toBe('abc-123?filter%5Bterm%5D=short_term&filter%5Bengine%5D=cost');
  });
});

describe('decodeRosDetailFetchQuery', () => {
  it('decodes id-only fetch keys', () => {
    expect(decodeRosDetailFetchQuery('abc-123')).toEqual({ id: 'abc-123' });
  });

  it('decodes projection filters from fetch keys', () => {
    expect(decodeRosDetailFetchQuery('abc-123?filter[term]=short_term&filter[engine]=cost')).toEqual({
      id: 'abc-123',
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
