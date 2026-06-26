import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchWorkloadTypes } from 'api/ros/workloadTypes';

export interface WorkloadTypesState {
  data: string[];
  isLoading: boolean;
  error: Error | null;
}

let cachedData: string[] | null = null;
let cachePromise: Promise<string[]> | null = null;

export function useWorkloadTypes(): WorkloadTypesState {
  const [data, setData] = useState<string[]>(cachedData ?? []);
  const [isLoading, setIsLoading] = useState(!cachedData);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (cachedData) {
      setData(cachedData);
      setIsLoading(false);
      return;
    }

    if (!cachePromise) {
      cachePromise = fetchWorkloadTypes()
        .then(resp => {
          cachedData = resp.data;
          return resp.data;
        })
        .catch(err => {
          cachePromise = null;
          throw err;
        });
    }

    try {
      const result = await cachePromise;
      if (isMounted.current) {
        setData(result);
        setIsLoading(false);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error };
}

export function workloadTypesToSelectOptions(types: string[]): { name: string; key: string }[] {
  return types.map(t => ({ name: t, key: t }));
}
