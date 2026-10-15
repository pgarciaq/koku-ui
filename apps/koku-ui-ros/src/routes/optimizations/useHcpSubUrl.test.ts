import { buildHcpSubParams, parseHcpSub } from './useHcpSubUrl';

describe('useHcpSubUrl params', () => {
  it('defaults to hosted when sub is missing or unknown', () => {
    expect(parseHcpSub('tab=hcp')).toBe('hosted');
    expect(parseHcpSub('tab=hcp&sub=something-else')).toBe('hosted');
    expect(parseHcpSub('tab=hcp&sub=overhead')).toBe('overhead');
  });

  it('sets the overhead sub while preserving all other params', () => {
    const params = buildHcpSubParams('tab=hcp&hcp_filter_by[cluster]=c1&hcp_term=short_term', 'overhead');

    expect(params.get('sub')).toBe('overhead');
    expect(params.get('tab')).toBe('hcp');
    expect(params.get('hcp_filter_by[cluster]')).toBe('c1');
    expect(params.get('hcp_term')).toBe('short_term');
  });

  it('sets the hosted sub without touching the tab param', () => {
    const params = buildHcpSubParams('tab=hcp&sub=overhead', 'hosted');

    expect(params.get('sub')).toBe('hosted');
    expect(params.get('tab')).toBe('hcp');
  });
});
