import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type StorageSubKey = 'pvc' | 'snapshot';

/** Sync Storage PVC | Snapshots toggle with the HCCM-level `sub` URL param. */
export function useOptimizationsSubUrl(defaultSub: StorageSubKey = 'pvc') {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const sub: StorageSubKey = params.get('sub') === 'snapshot' ? 'snapshot' : defaultSub;

  const setSub = useCallback(
    (nextSub: StorageSubKey) => {
      const nextParams = new URLSearchParams(location.search);
      nextParams.set('tab', 'storage');
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
