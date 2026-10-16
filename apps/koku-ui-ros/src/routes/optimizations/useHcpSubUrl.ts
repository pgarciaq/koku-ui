import { useLocation } from 'react-router-dom';

export type HcpSubKey = 'hosted' | 'overhead';

/** Read the HCP sub-view from a URL search string. Unknown values fall back to 'hosted'. */
export function parseHcpSub(currentSearch: string): HcpSubKey {
  const params = new URLSearchParams(currentSearch);
  return params.get('sub') === 'overhead' ? 'overhead' : 'hosted';
}

/** Sync the HCP Hosted-clusters | Management-overhead toggle with the `sub` URL param.
 *
 * Read-only: sub writes always ride along with a setQuery navigation
 * (see useUrlState extras). A standalone sub navigate followed by setQuery
 * reads the same stale location.search twice and the second replace
 * silently drops sub — the toggle visibly did nothing. Do not re-add a
 * navigating setSub here.
 */
export function useHcpSubUrl(defaultSub: HcpSubKey = 'hosted') {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sub: HcpSubKey = params.get('sub') === 'overhead' ? 'overhead' : defaultSub;

  return { sub };
}
