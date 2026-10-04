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
import { Interval, OptimizationType } from 'utils/commonTypes';

export const hcpRecommendationsBaseQuery: RosQuery = {
  limit: 10,
  offset: 0,
  term: Interval.short_term,
  engine: OptimizationType.cost,
  order_by: {
    estimated_monthly_savings: 'desc',
  },
};

export interface HcpRecommendationsReportState {
  report: RosReport;
  reportError: AxiosError;
  reportFetchStatus: FetchStatus;
  reportQueryString: string;
}

export interface UseHcpRecommendationsReportProps {
  cluster?: string | string[];
  query: RosQuery;
  skipFetch?: boolean;
}

export const useHcpRecommendationsReport = ({
  cluster,
  query,
  skipFetch = false,
}: UseHcpRecommendationsReportProps): HcpRecommendationsReportState => {
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const order_by = getOrderById(query) || getOrderById(hcpRecommendationsBaseQuery);
  const order_how = getOrderByValue(query) || getOrderByValue(hcpRecommendationsBaseQuery);

  const filterBy = expandTagFilters(query.filter_by);

  const reportQuery = withRosListProjection({
    ...(cluster && { cluster }),
    ...filterBy,
    limit: query.limit,
    ...(query.after ? { after: query.after } : { offset: query.offset }),
    ...(query.group_by ? { group_by: query.group_by } : {}),
    order_by,
    order_how,
    term: query.term,
    engine: query.engine,
  });
  const reportQueryString = getQuery(reportQuery);

  const reportPathsType = RosPathsType.hcpRecommendations;
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
