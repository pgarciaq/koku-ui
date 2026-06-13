import { getQuery } from 'api/queries/query';
import type { RosPathsType, RosType } from 'api/ros/ros';
import { withRosListProjection } from 'api/ros/rosListParams';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import type { RootState } from 'store';
import { FetchStatus } from 'store/common';
import { rosActions, rosSelectors } from 'store/ros';

export interface UseRosCountOptions {
  cluster?: string | string[];
  engine?: string;
  project?: string | string[];
  rosPathsType: RosPathsType;
  rosType: RosType;
  term?: string;
}

export interface UseRosCountResult {
  count: number;
  fetchStatus?: FetchStatus;
}

/**
 * Reads optimization count from the shared Redux count cache when available,
 * falling back to a lightweight limit=1 list fetch only when no cached count exists.
 */
export function useRosCount({
  cluster,
  engine,
  project,
  rosPathsType,
  rosType,
  term,
}: UseRosCountOptions): UseRosCountResult {
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();

  const countFilters = useMemo(
    () =>
      withRosListProjection({
        ...(cluster && { cluster }),
        ...(project && { project }),
        ...(term && { term }),
        ...(engine && { engine }),
      }),
    [cluster, engine, project, term]
  );

  const countQueryString = getQuery(countFilters);
  const cachedCount = useSelector((state: RootState) =>
    rosSelectors.selectRosCount(state, rosPathsType, rosType, countQueryString)
  );

  const fallbackQueryString = getQuery({ ...countFilters, limit: 1 });
  const fallbackReport = useSelector((state: RootState) =>
    rosSelectors.selectRos(state, rosPathsType, rosType, fallbackQueryString)
  );
  const fallbackFetchStatus = useSelector((state: RootState) =>
    rosSelectors.selectRosFetchStatus(state, rosPathsType, rosType, fallbackQueryString)
  );
  const fallbackError = useSelector((state: RootState) =>
    rosSelectors.selectRosError(state, rosPathsType, rosType, fallbackQueryString)
  );

  useEffect(() => {
    if (cachedCount !== undefined || fallbackError || fallbackFetchStatus === FetchStatus.inProgress) {
      return;
    }
    dispatch(rosActions.fetchRosReport(rosPathsType, rosType, fallbackQueryString));
  }, [cachedCount, dispatch, fallbackError, fallbackFetchStatus, fallbackQueryString, rosPathsType, rosType]);

  if (cachedCount !== undefined) {
    return { count: cachedCount, fetchStatus: FetchStatus.complete };
  }

  return {
    count: fallbackReport?.meta?.count ?? 0,
    fetchStatus: fallbackFetchStatus,
  };
}
