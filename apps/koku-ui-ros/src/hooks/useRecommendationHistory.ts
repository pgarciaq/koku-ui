import type { HistoryListResponse, RecommendationHistoryParams } from 'api/ros/recommendationHistory';
import { fetchRecommendationHistory } from 'api/ros/recommendationHistory';
import { useEffect, useState } from 'react';
import { FetchStatus } from 'store/common';

export interface UseRecommendationHistoryResult {
  data?: HistoryListResponse;
  fetchStatus: FetchStatus;
  error?: string;
}

export function useRecommendationHistory(
  params: RecommendationHistoryParams | null
): UseRecommendationHistoryResult {
  const [data, setData] = useState<HistoryListResponse | undefined>();
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

    fetchRecommendationHistory(params)
      .then(res => {
        if (!cancelled) {
          setData(res.data);
          setFetchStatus(FetchStatus.complete);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setData(undefined);
          setError(err?.message ?? 'Failed to fetch recommendation history');
          setFetchStatus(FetchStatus.none);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [paramKey]);

  return { data, fetchStatus, error };
}
