import type { FleetHeatmapParams, FleetHeatmapResponse } from 'api/ros/fleetHeatmap';
import { fetchFleetHeatmap } from 'api/ros/fleetHeatmap';
import { useEffect, useState } from 'react';
import { FetchStatus } from 'store/common';

export interface UseFleetHeatmapResult {
  data?: FleetHeatmapResponse;
  fetchStatus: FetchStatus;
  error?: string;
}

export function useFleetHeatmap(params?: FleetHeatmapParams): UseFleetHeatmapResult {
  const [data, setData] = useState<FleetHeatmapResponse | undefined>();
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>(FetchStatus.inProgress);
  const [error, setError] = useState<string | undefined>();

  const paramKey = JSON.stringify(params ?? {});

  useEffect(() => {
    let cancelled = false;
    setFetchStatus(FetchStatus.inProgress);
    setError(undefined);

    fetchFleetHeatmap(params)
      .then(res => {
        if (!cancelled) {
          setData(res.data);
          setFetchStatus(FetchStatus.complete);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setData(undefined);
          setError(err?.message ?? 'Failed to fetch fleet heatmap data');
          setFetchStatus(FetchStatus.none);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [paramKey]);

  return { data, fetchStatus, error };
}
