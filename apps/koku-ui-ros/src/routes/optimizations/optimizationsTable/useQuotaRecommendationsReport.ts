import { getQuery } from 'api/queries/query';
import type { RosQuery } from 'api/queries/rosQuery';
import type { QuotaRecommendationReport } from 'api/ros/recommendations';
import { RosPathsType, RosType } from 'api/ros/ros';
import { withRosListProjection } from 'api/ros/rosListParams';
import type { AxiosError } from 'axios';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import { getOrderById, getOrderByValue } from 'routes/utils/orderBy';
import type { RootState } from 'store';
import { FetchStatus } from 'store/common';
import { rosActions, rosSelectors } from 'store/ros';
import { Interval, OptimizationType } from 'utils/commonTypes';

export const quotaRecommendationsBaseQuery: RosQuery = {
  limit: 10,
  offset: 0,
  term: Interval.medium_term,
  engine: OptimizationType.cost,
  order_by: {
    utilization: 'desc',
  },
};

export interface QuotaRecommendationsReportState {
  report: QuotaRecommendationReport;
  reportError: AxiosError;
  reportFetchStatus: FetchStatus;
  reportQueryString: string;
}

function buildQuotaFilter(query: RosQuery): Record<string, string> {
  const filter: Record<string, string> = {};
  if (query.filter_by?.cluster) {
    filter.cluster = query.filter_by.cluster;
  }
  if (query.filter_by?.project) {
    filter.project = query.filter_by.project;
  }
  if (query.filter_by?.quota_name) {
    filter.quota_name = query.filter_by.quota_name;
  }
  const recType = query.filter_by?.classification ?? query.filter_by?.recommendation_type;
  if (recType) {
    filter.recommendation_type = recType;
  }
  if (query.filter_by?.risk_level) {
    filter.risk_level = query.filter_by.risk_level;
  }
  return filter;
}

export const useQuotaRecommendationsReport = ({
  query,
  skipFetch = false,
}: {
  query: RosQuery;
  skipFetch?: boolean;
}): QuotaRecommendationsReportState => {
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const order_by = getOrderById(query) || getOrderById(quotaRecommendationsBaseQuery);
  const order_how = getOrderByValue(query) || getOrderByValue(quotaRecommendationsBaseQuery);
  const filter = buildQuotaFilter(query);

  const reportQuery = withRosListProjection({
    ...(Object.keys(filter).length > 0 && { filter }),
    limit: query.limit,
    ...(query.after ? { after: query.after } : { offset: query.offset ?? 0 }),
    order_by,
    order_how,
    ...(query.group_by && { group_by: query.group_by }),
    term: query.term,
    engine: query.engine,
  });
  const reportQueryString = getQuery(reportQuery);

  const reportPathsType = RosPathsType.quotaRecommendations;
  const reportType = RosType.ros as any;

  const report = useSelector((state: RootState) =>
    rosSelectors.selectRos(state, reportPathsType, reportType, reportQueryString)
  ) as unknown as QuotaRecommendationReport;
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
