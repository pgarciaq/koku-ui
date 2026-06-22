import { getQuery } from 'api/queries/query';
import type { RosQuery } from 'api/queries/rosQuery';
import type { RosReport } from 'api/ros/ros';
import { RosPathsType, RosType } from 'api/ros/ros';
import { withRosListProjection } from 'api/ros/rosListParams';
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

export const namespaceRecommendationsBaseQuery: RosQuery = {
  limit: 10,
  offset: 0,
  order_by: {
    estimated_monthly_savings: 'desc',
  },
};

export interface NamespaceRecommendationsReportState {
  report: RosReport;
  reportError: AxiosError;
  reportFetchStatus: FetchStatus;
  reportQueryString: string;
}

export interface UseNamespaceRecommendationsReportProps {
  cluster?: string | string[];
  query: RosQuery;
  skipFetch?: boolean;
}

export const useNamespaceRecommendationsReport = ({
  cluster,
  query,
  skipFetch = false,
}: UseNamespaceRecommendationsReportProps): NamespaceRecommendationsReportState => {
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const order_by = getOrderById(query) || getOrderById(namespaceRecommendationsBaseQuery);
  const order_how = getOrderByValue(query) || getOrderByValue(namespaceRecommendationsBaseQuery);

  const filterBy = expandTagFilters(query.filter_by);

  const reportQuery = withRosListProjection({
    ...(cluster && { cluster }),
    ...filterBy,
    limit: query.limit,
    ...(query.after ? { after: query.after } : { offset: query.offset }),
    order_by,
    order_how,
  });
  const reportQueryString = getQuery(reportQuery);

  const reportPathsType = RosPathsType.namespaceRecommendations;
  const reportType = RosType.ros as any;

  const report = useSelector((state: RootState) =>
    rosSelectors.selectRos(state, reportPathsType, reportType, reportQueryString)
  );
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
