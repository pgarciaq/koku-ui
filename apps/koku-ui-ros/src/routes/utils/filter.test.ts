import { expandTagFilters } from './filter';

describe('expandTagFilters', () => {
  it('returns empty object for undefined input', () => {
    expect(expandTagFilters(undefined)).toEqual({});
  });

  it('returns empty object for empty input', () => {
    expect(expandTagFilters({})).toEqual({});
  });

  it('passes non-tag filters through unchanged', () => {
    expect(expandTagFilters({ cluster: 'foo' })).toEqual({ cluster: 'foo' });
  });

  it('expands a single legacy tag string', () => {
    expect(expandTagFilters({ tag: 'key=value' })).toEqual({ 'filter[tag:key]': 'value' });
  });

  it('expands an array of different legacy tags', () => {
    expect(expandTagFilters({ tag: ['env=prod', 'app=web'] })).toEqual({
      'filter[tag:env]': 'prod',
      'filter[tag:app]': 'web',
    });
  });

  it('groups multiple values for the same legacy tag key into an array', () => {
    expect(expandTagFilters({ tag: ['env=prod', 'env=stage'] })).toEqual({
      'filter[tag:env]': ['prod', 'stage'],
    });
  });

  it('skips legacy entries without an = sign', () => {
    expect(expandTagFilters({ tag: 'invalidtag' })).toEqual({});
  });

  it('preserves non-tag filters alongside expanded legacy tags', () => {
    expect(expandTagFilters({ cluster: 'c1', tag: 'env=prod' })).toEqual({
      cluster: 'c1',
      'filter[tag:env]': 'prod',
    });
  });

  it('keeps an empty string value after =', () => {
    expect(expandTagFilters({ tag: 'key=' })).toEqual({ 'filter[tag:key]': '' });
  });

  it('skips entries where = is at position 0', () => {
    expect(expandTagFilters({ tag: '=value' })).toEqual({});
  });

  // New dropdown-selected format tests
  it('handles dropdown-selected tag:key format', () => {
    expect(expandTagFilters({ 'tag:env': 'prod' })).toEqual({ 'filter[tag:env]': 'prod' });
  });

  it('handles dropdown-selected tag:key with array values', () => {
    expect(expandTagFilters({ 'tag:env': ['prod', 'stage'] })).toEqual({
      'filter[tag:env]': ['prod', 'stage'],
    });
  });

  it('handles multiple dropdown-selected tag keys', () => {
    expect(expandTagFilters({ 'tag:env': 'prod', 'tag:app': 'web' })).toEqual({
      'filter[tag:env]': 'prod',
      'filter[tag:app]': 'web',
    });
  });

  it('handles mixed non-tag, legacy tag, and dropdown tag formats', () => {
    expect(
      expandTagFilters({
        cluster: 'c1',
        tag: 'region=us-east',
        'tag:env': 'prod',
      })
    ).toEqual({
      cluster: 'c1',
      'filter[tag:region]': 'us-east',
      'filter[tag:env]': 'prod',
    });
  });
});
