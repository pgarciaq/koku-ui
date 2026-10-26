import type { HcpCapacityRow } from 'api/ros/hcpCapacity';
import { fetchHcpCapacityLatest } from 'api/ros/hcpCapacity';
import { useEffect, useState } from 'react';
import { FetchStatus } from 'store/common';

export interface UseHcpCapacityLatestResult {
  rows?: HcpCapacityRow[];
  fetchStatus: FetchStatus;
}

// Latest fleet-capacity snapshots for the card list. Unfiltered (one row
// per management cluster in the org) unless a cluster is selected, in
// which case the API narrows to that cluster's row. A failed fetch (e.g.
// the hcp plugin disabled → 404) degrades to no rows: the advisory panel
// never breaks the recommendations page.
export function useHcpCapacityLatest(cluster?: string): UseHcpCapacityLatestResult {
  const [rows, setRows] = useState<HcpCapacityRow[] | undefined>();
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>(FetchStatus.inProgress);

  useEffect(() => {
    let cancelled = false;
    setFetchStatus(FetchStatus.inProgress);

    fetchHcpCapacityLatest(cluster)
      .then(res => {
        if (!cancelled) {
          setRows(res.data?.data);
          setFetchStatus(FetchStatus.complete);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRows(undefined);
          setFetchStatus(FetchStatus.none);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cluster]);

  return { rows, fetchStatus };
}
