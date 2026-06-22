import type { RosQuery } from 'api/queries/rosQuery';

import { deserializeQuery, serializeQuery } from './useUrlState';

const prefix = 'ns_';

describe('serializeQuery', () => {
  it('serializes limit', () => {
    const params = serializeQuery({ limit: 25 } as RosQuery, prefix);
    expect(params.get('ns_limit')).toBe('25');
  });

  it('serializes offset', () => {
    const params = serializeQuery({ offset: 10 } as RosQuery, prefix);
    expect(params.get('ns_offset')).toBe('10');
  });

  it('serializes after cursor', () => {
    const params = serializeQuery({ after: 'abc123' } as RosQuery, prefix);
    expect(params.get('ns_after')).toBe('abc123');
  });

  it('serializes order_by as key:direction', () => {
    const params = serializeQuery({ order_by: { project: 'asc' } } as RosQuery, prefix);
    expect(params.get('ns_order_by')).toBe('project:asc');
  });

  it('serializes filter_by with bracket notation', () => {
    const params = serializeQuery({ filter_by: { cluster: 'c1' } } as RosQuery, prefix);
    expect(params.get('ns_filter_by[cluster]')).toBe('c1');
  });

  it('serializes multi-value filter_by as repeated keys', () => {
    const params = serializeQuery({ filter_by: { cluster: ['c1', 'c2'] } } as RosQuery, prefix);
    expect(params.getAll('ns_filter_by[cluster]')).toEqual(['c1', 'c2']);
  });

  it('serializes term and engine', () => {
    const params = serializeQuery({ term: 'short_term', engine: 'cost' } as RosQuery, prefix);
    expect(params.get('ns_term')).toBe('short_term');
    expect(params.get('ns_engine')).toBe('cost');
  });

  it('omits keys with null or undefined values', () => {
    const params = serializeQuery({} as RosQuery, prefix);
    expect(Array.from(params.keys())).toHaveLength(0);
  });
});

describe('deserializeQuery', () => {
  it('returns empty partial for empty params', () => {
    expect(deserializeQuery(new URLSearchParams(), prefix)).toEqual({});
  });

  it('deserializes limit', () => {
    const params = new URLSearchParams('ns_limit=25');
    expect(deserializeQuery(params, prefix)).toMatchObject({ limit: 25 });
  });

  it('deserializes offset', () => {
    const params = new URLSearchParams('ns_offset=10');
    expect(deserializeQuery(params, prefix)).toMatchObject({ offset: 10 });
  });

  it('deserializes after cursor', () => {
    const params = new URLSearchParams('ns_after=abc123');
    expect(deserializeQuery(params, prefix)).toMatchObject({ after: 'abc123' });
  });

  it('deserializes order_by from key:direction format', () => {
    const params = new URLSearchParams('ns_order_by=project:asc');
    expect(deserializeQuery(params, prefix)).toMatchObject({
      order_by: { project: 'asc' },
    });
  });

  it('deserializes filter_by from bracket notation', () => {
    const params = new URLSearchParams('ns_filter_by[cluster]=c1');
    expect(deserializeQuery(params, prefix)).toMatchObject({
      filter_by: { cluster: 'c1' },
    });
  });

  it('deserializes repeated filter_by keys into an array', () => {
    const params = new URLSearchParams('ns_filter_by[cluster]=c1&ns_filter_by[cluster]=c2');
    expect(deserializeQuery(params, prefix)).toMatchObject({
      filter_by: { cluster: ['c1', 'c2'] },
    });
  });

  it('deserializes term and engine', () => {
    const params = new URLSearchParams('ns_term=medium_term&ns_engine=performance');
    expect(deserializeQuery(params, prefix)).toMatchObject({
      term: 'medium_term',
      engine: 'performance',
    });
  });

  it('ignores params without the prefix', () => {
    const params = new URLSearchParams('other_limit=99&ns_limit=10');
    const result = deserializeQuery(params, prefix);
    expect(result.limit).toBe(10);
    expect(result).not.toHaveProperty('other_limit');
  });
});

describe('serialize/deserialize roundtrip', () => {
  it('reconstructs original query', () => {
    const original: RosQuery = {
      limit: 25,
      offset: 10,
      after: 'cursor-token',
      order_by: { last_reported: 'desc' },
      filter_by: { cluster: 'c1', project: ['p1', 'p2'] },
    };
    const params = serializeQuery(original, prefix);
    const restored = deserializeQuery(params, prefix);
    expect(restored).toEqual({
      limit: 25,
      offset: 10,
      after: 'cursor-token',
      order_by: { last_reported: 'desc' },
      filter_by: { cluster: 'c1', project: ['p1', 'p2'] },
    });
  });

  it('roundtrips with an empty prefix', () => {
    const original: RosQuery = {
      limit: 10,
      order_by: { project: 'asc' },
    };
    const params = serializeQuery(original, '');
    const restored = deserializeQuery(params, '');
    expect(restored).toMatchObject({
      limit: 10,
      order_by: { project: 'asc' },
    });
  });

  it('roundtrips term and engine', () => {
    const original: RosQuery = {
      term: 'long_term',
      engine: 'performance',
      limit: 25,
    };
    const params = serializeQuery(original, prefix);
    const restored = deserializeQuery(params, prefix);
    expect(restored).toMatchObject({
      term: 'long_term',
      engine: 'performance',
      limit: 25,
    });
  });
});
