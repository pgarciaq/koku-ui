import { getQuery } from 'api/queries/query';
import type { RosQuery } from 'api/queries/rosQuery';
import { RosPathsType, RosType } from 'api/ros/ros';
import { withRosListProjection } from 'api/ros/rosListParams';
import type { NodeRecommendationReport } from 'api/ros/recommendations';
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

export const nodeRecommendationsBaseQuery: RosQuery = {
  limit: 10,
  offset: 0,
  term: Interval.short_term,
  engine: OptimizationType.cost,
  order_by: {
    estimated_monthly_savings: 'desc',
  },
};

export interface NodeRecommendationsReportState {
  report: NodeRecommendationReport;
  reportError: AxiosError;
  reportFetchStatus: FetchStatus;
  reportQueryString: string;
}

export interface UseNodeRecommendationsReportProps {
  query: RosQuery;
  skipFetch?: boolean;
}

export const useNodeRecommendationsReport = ({
  query,
  skipFetch = false,
}: UseNodeRecommendationsReportProps): NodeRecommendationsReportState => {
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const order_by = getOrderById(query) || getOrderById(nodeRecommendationsBaseQuery);
  const order_how = getOrderByValue(query) || getOrderByValue(nodeRecommendationsBaseQuery);

  const categoryParams: Record<string, any> = {};
  const categoryValue = query.filter_by?.category;
  if (categoryValue) {
    categoryParams['filter[category]'] = categoryValue;
  }

  const tagFilterEntries: Record<string, any> = {};
  if (query.filter_by) {
    for (const [key, val] of Object.entries(query.filter_by)) {
      if (key === 'tag' || key.startsWith('tag:')) {
        tagFilterEntries[key] = val;
      }
    }
  }
  const tagFilters = expandTagFilters(tagFilterEntries);

  const reportQuery = withRosListProjection({
    ...(query.filter_by?.cluster && { cluster_uuid: query.filter_by.cluster }),
    ...(query.filter_by?.node && { node: query.filter_by.node }),
    ...categoryParams,
    ...tagFilters,
    limit: query.limit,
    ...(query.after ? { after: query.after } : { offset: query.offset ?? 0 }),
    order_by,
    order_how,
    term: query.term,
    engine: query.engine,
  });
  const reportQueryString = getQuery(reportQuery);

  const reportPathsType = RosPathsType.nodeRecommendations;
  const reportType = RosType.ros as any;

  const report = useSelector((state: RootState) =>
    rosSelectors.selectRos(state, reportPathsType, reportType, reportQueryString)
  ) as unknown as NodeRecommendationReport;
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
