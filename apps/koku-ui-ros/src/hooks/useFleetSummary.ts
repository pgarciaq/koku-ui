import type { FleetSummaryResponse } from 'api/ros/fleetSummary';
import { fetchFleetSummary } from 'api/ros/fleetSummary';
import { useEffect, useState } from 'react';
import { FetchStatus } from 'store/common';

export interface UseFleetSummaryResult {
  data?: FleetSummaryResponse;
  fetchStatus: FetchStatus;
}

export function useFleetSummary(): UseFleetSummaryResult {
  const [data, setData] = useState<FleetSummaryResponse | undefined>();
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>(FetchStatus.inProgress);

  useEffect(() => {
    let cancelled = false;
    setFetchStatus(FetchStatus.inProgress);

    fetchFleetSummary()
      .then(res => {
        if (!cancelled) {
          setData(res.data);
          setFetchStatus(FetchStatus.complete);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(undefined);
          setFetchStatus(FetchStatus.none);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, fetchStatus };
}
