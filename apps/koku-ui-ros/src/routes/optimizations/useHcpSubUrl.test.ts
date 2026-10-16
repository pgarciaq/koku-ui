import { parseHcpSub } from './useHcpSubUrl';

describe('useHcpSubUrl params', () => {
  it('defaults to hosted when sub is missing or unknown', () => {
    expect(parseHcpSub('tab=hcp')).toBe('hosted');
    expect(parseHcpSub('tab=hcp&sub=something-else')).toBe('hosted');
    expect(parseHcpSub('tab=hcp&sub=overhead')).toBe('overhead');
  });
});
