import type { NodeHourlyUtilizationParams, NodeHourlyUtilizationResponse } from 'api/ros/nodeHourlyUtilization';
import { fetchNodeHourlyUtilization } from 'api/ros/nodeHourlyUtilization';
import { useEffect, useState } from 'react';
import { FetchStatus } from 'store/common';

export interface UseNodeHourlyUtilizationResult {
  data?: NodeHourlyUtilizationResponse;
  fetchStatus: FetchStatus;
  error?: string;
}

export function useNodeHourlyUtilization(params: NodeHourlyUtilizationParams | null): UseNodeHourlyUtilizationResult {
  const [data, setData] = useState<NodeHourlyUtilizationResponse | undefined>();
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

    fetchNodeHourlyUtilization(params)
      .then(res => {
        if (!cancelled) {
          setData(res.data);
          setFetchStatus(FetchStatus.complete);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setData(undefined);
          setError(err?.message ?? 'Failed to fetch node hourly utilization data');
          setFetchStatus(FetchStatus.none);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [paramKey]);

  return { data, fetchStatus, error };
}
