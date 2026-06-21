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

  it('expands a single string tag', () => {
    expect(expandTagFilters({ tag: 'key=value' })).toEqual({ 'tag:key': 'value' });
  });

  it('expands an array of different tags', () => {
    expect(expandTagFilters({ tag: ['env=prod', 'app=web'] })).toEqual({
      'tag:env': 'prod',
      'tag:app': 'web',
    });
  });

  it('groups multiple values for the same tag key into an array', () => {
    expect(expandTagFilters({ tag: ['env=prod', 'env=stage'] })).toEqual({
      'tag:env': ['prod', 'stage'],
    });
  });

  it('skips entries without an = sign', () => {
    expect(expandTagFilters({ tag: 'invalidtag' })).toEqual({});
  });

  it('preserves non-tag filters alongside expanded tags', () => {
    expect(expandTagFilters({ cluster: 'c1', tag: 'env=prod' })).toEqual({
      cluster: 'c1',
      'tag:env': 'prod',
    });
  });

  it('keeps an empty string value after =', () => {
    expect(expandTagFilters({ tag: 'key=' })).toEqual({ 'tag:key': '' });
  });

  it('skips entries where = is at position 0', () => {
    expect(expandTagFilters({ tag: '=value' })).toEqual({});
  });
});
