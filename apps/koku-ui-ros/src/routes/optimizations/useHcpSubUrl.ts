import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type HcpSubKey = 'hosted' | 'overhead';

/** Read the HCP sub-view from a URL search string. Unknown values fall back to 'hosted'. */
export function parseHcpSub(currentSearch: string): HcpSubKey {
  const params = new URLSearchParams(currentSearch);
  return params.get('sub') === 'overhead' ? 'overhead' : 'hosted';
}

/** Build search params for an HCP sub-view, preserving every other param (filters, term, engine). */
export function buildHcpSubParams(currentSearch: string, nextSub: HcpSubKey): URLSearchParams {
  const params = new URLSearchParams(currentSearch);
  params.set('sub', nextSub);
  return params;
}

/** Sync the HCP Hosted-clusters | Management-overhead toggle with the `sub` URL param. */
export function useHcpSubUrl(defaultSub: HcpSubKey = 'hosted') {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const sub: HcpSubKey = params.get('sub') === 'overhead' ? 'overhead' : defaultSub;

  const setSub = useCallback(
    (nextSub: HcpSubKey) => {
      const search = buildHcpSubParams(location.search, nextSub).toString();
      navigate(`${location.pathname}?${search}`, {
        replace: true,
        state: location.state,
      });
    },
    [location.pathname, location.search, location.state, navigate]
  );

  return { sub, setSub };
}
