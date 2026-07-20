import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type GpuSubKey = 'mig' | 'timeslicing';

/** Sync GPU MIG | Timeslicing toggle with the HCCM-level `gpu_sub` URL param. */
export function useOptimizationsGpuSubUrl(defaultSub: GpuSubKey = 'mig') {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const sub: GpuSubKey = params.get('gpu_sub') === 'timeslicing' ? 'timeslicing' : defaultSub;

  const setSub = useCallback(
    (nextSub: GpuSubKey) => {
      const nextParams = new URLSearchParams(location.search);
      nextParams.set('tab', 'gpu');
      nextParams.set('gpu_sub', nextSub);
      navigate(`${location.pathname}?${nextParams.toString()}`, {
        replace: true,
        state: location.state,
      });
    },
    [location.pathname, location.search, location.state, navigate]
  );

  return { sub, setSub };
}
