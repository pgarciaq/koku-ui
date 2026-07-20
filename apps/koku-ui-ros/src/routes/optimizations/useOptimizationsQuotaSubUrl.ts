import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type QuotaSubKey = 'namespace' | 'cluster';

/** Sync Quota Namespace | ClusterResourceQuota toggle with the HCCM-level `sub` URL param. */
export function useOptimizationsQuotaSubUrl(defaultSub: QuotaSubKey = 'namespace') {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const sub: QuotaSubKey = params.get('sub') === 'cluster' ? 'cluster' : defaultSub;

  const setSub = useCallback(
    (nextSub: QuotaSubKey) => {
      const nextParams = new URLSearchParams(location.search);
      nextParams.set('tab', 'quota');
      nextParams.set('sub', nextSub);
      navigate(`${location.pathname}?${nextParams.toString()}`, {
        replace: true,
        state: location.state,
      });
    },
    [location.pathname, location.search, location.state, navigate]
  );

  return { sub, setSub };
}
