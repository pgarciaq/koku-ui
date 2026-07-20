import type { VmHourlyActivityParams, VmHourlyActivityResponse } from 'api/ros/vmHourlyActivity';
import { fetchVmHourlyActivity } from 'api/ros/vmHourlyActivity';
import { useEffect, useState } from 'react';
import { FetchStatus } from 'store/common';

export interface UseVmHourlyActivityResult {
  data?: VmHourlyActivityResponse;
  fetchStatus: FetchStatus;
  error?: string;
}

export function useVmHourlyActivity(params: VmHourlyActivityParams | null): UseVmHourlyActivityResult {
  const [data, setData] = useState<VmHourlyActivityResponse | undefined>();
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>(FetchStatus.inProgress);
  const [error, setError] = useState<string | undefined>();

  const paramKey = JSON.stringify(params ?? {});

  useEffect(() => {
    if (!params) {
      setFetchStatus(FetchStatus.none);
      return;
    }

    let cancelled = false;
    setFetchStatus(FetchStatus.inProgress);
    setError(undefined);

    fetchVmHourlyActivity(params)
      .then(res => {
        if (!cancelled) {
          setData(res.data);
          setFetchStatus(FetchStatus.complete);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setData(undefined);
          setError(err?.message ?? 'Failed to fetch VM hourly activity data');
          setFetchStatus(FetchStatus.none);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [paramKey]);

  return { data, fetchStatus, error };
}
