import { getQuery } from 'api/queries/query';
import type { RosQuery } from 'api/queries/rosQuery';
import type { PvcRecommendationReport } from 'api/ros/recommendations';
import { RosPathsType, RosType } from 'api/ros/ros';
import type { AxiosError } from 'axios';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import { expandTagFilters } from 'routes/utils/filter';
import { getOrderById, getOrderByValue } from 'routes/utils/orderBy';
import type { RootState } from 'store';
import { FetchStatus } from 'store/common';
import { rosActions, rosSelectors } from 'store/ros';
import { Interval } from 'utils/commonTypes';

export const pvcRecommendationsBaseQuery: RosQuery = {
  limit: 10,
  offset: 0,
  term: Interval.medium_term,
  order_by: {
    estimated_monthly_savings: 'desc',
  },
};

function toApiTerm(term?: string): string | undefined {
  if (!term) {
    return undefined;
  }
  return term.replace(/_term$/, '');
}

export interface PvcRecommendationsReportState {
  report: PvcRecommendationReport;
  reportError: AxiosError;
  reportFetchStatus: FetchStatus;
  reportQueryString: string;
}

export const usePvcRecommendationsReport = ({
  query,
  skipFetch = false,
}: {
  query: RosQuery;
  skipFetch?: boolean;
}): PvcRecommendationsReportState => {
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const order_by = getOrderById(query) || getOrderById(pvcRecommendationsBaseQuery);
  const order_how = getOrderByValue(query) || getOrderByValue(pvcRecommendationsBaseQuery);

  const tagFilterEntries: Record<string, any> = {};
  if (query.filter_by) {
    for (const [key, val] of Object.entries(query.filter_by)) {
      if (key === 'tag' || key.startsWith('tag:')) {
        tagFilterEntries[key] = val;
      }
    }
  }
  const tagFilters = expandTagFilters(tagFilterEntries);

  const reportQuery: Record<string, any> = {
    ...(query.filter_by?.cluster && { cluster_uuid: query.filter_by.cluster }),
    ...(query.filter_by?.project && { namespace: query.filter_by.project }),
    ...(query.filter_by?.namespace && { namespace: query.filter_by.namespace }),
    ...(query.filter_by?.classification && { recommendation_type: query.filter_by.classification }),
    ...(query.filter_by?.recommendation_type && { recommendation_type: query.filter_by.recommendation_type }),
    ...(query.filter_by?.pvc_name && { pvc_name: query.filter_by.pvc_name }),
    ...(query.filter_by?.storageclass && { storageclass: query.filter_by.storageclass }),
    ...tagFilters,
    limit: query.limit,
    ...(query.after ? { after: query.after } : { offset: query.offset ?? 0 }),
    order_by,
    order_how,
    ...(toApiTerm(query.term) && { term: toApiTerm(query.term) }),
    ...(query.group_by && { group_by: query.group_by }),
  };
  const reportQueryString = getQuery(reportQuery);

  const reportPathsType = RosPathsType.pvcRecommendations;
  const reportType = RosType.ros as any;

  const report = useSelector((state: RootState) =>
    rosSelectors.selectRos(state, reportPathsType, reportType, reportQueryString)
  ) as unknown as PvcRecommendationReport;
  const reportFetchStatus = useSelector((state: RootState) =>
    rosSelectors.selectRosFetchStatus(state, reportPathsType, reportType, reportQueryString)
  );
  const reportError = useSelector((state: RootState) =>
    rosSelectors.selectRosError(state, reportPathsType, reportType, reportQueryString)
  );

  const lastFailedQuery = useRef<string>(null);

  useEffect(() => {
    if (skipFetch || reportFetchStatus === FetchStatus.inProgress) {
      return;
    }
    if (reportError && lastFailedQuery.current === reportQueryString) {
      return;
    }
    if (reportError) {
      lastFailedQuery.current = reportQueryString;
    }
    dispatch(rosActions.fetchRosReport(reportPathsType, reportType, reportQueryString));
  }, [dispatch, reportError, reportFetchStatus, reportQueryString, skipFetch]);

  return {
    report,
    reportError,
    reportFetchStatus,
    reportQueryString,
  };
};
