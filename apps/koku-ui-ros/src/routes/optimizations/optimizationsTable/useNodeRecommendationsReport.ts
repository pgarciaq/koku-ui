import { getQuery } from 'api/queries/query';
import type { RosQuery } from 'api/queries/rosQuery';
import { RosPathsType, RosType } from 'api/ros/ros';
import type { NodeRecommendationReport } from 'api/ros/recommendations';
import type { AxiosError } from 'axios';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import { getOrderById, getOrderByValue } from 'routes/utils/orderBy';
import type { RootState } from 'store';
import { FetchStatus } from 'store/common';
import { rosActions, rosSelectors } from 'store/ros';

export const nodeRecommendationsBaseQuery: RosQuery = {
  limit: 10,
  offset: 0,
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

  const classificationParams: Record<string, any> = {};
  const classificationValue = query.filter_by?.classification;
  if (classificationValue) {
    switch (classificationValue) {
      case 'underutilized':
        classificationParams['filter[is_underutilized]'] = 'true';
        break;
      case 'overcommitted':
        classificationParams['filter[is_overcommitted]'] = 'true';
        break;
      case 'idle':
        classificationParams['filter[idle_state]'] = 'idle';
        break;
      case 'stranded_cpu':
        classificationParams['filter[stranded_resource]'] = 'cpu';
        break;
      case 'stranded_memory':
        classificationParams['filter[stranded_resource]'] = 'memory';
        break;
      case 'well_utilized':
        classificationParams['filter[is_underutilized]'] = 'false';
        break;
    }
  }

  const reportQuery: Record<string, any> = {
    ...(query.filter_by?.cluster && { cluster_uuid: query.filter_by.cluster }),
    ...(query.filter_by?.node && { node: query.filter_by.node }),
    ...classificationParams,
    limit: query.limit,
    ...(query.after ? { after: query.after } : { offset: query.offset ?? 0 }),
    order_by,
    order_how,
  };
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
