import { getQuery } from 'api/queries/query';
import type { RosQuery } from 'api/queries/rosQuery';
import type { RosReport } from 'api/ros/ros';
import { RosPathsType, RosType } from 'api/ros/ros';
import { withRosListProjection } from 'api/ros/rosListParams';
import type { AxiosError } from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import { expandTagFilters } from 'routes/utils/filter';
import { getOrderById, getOrderByValue } from 'routes/utils/orderBy';
import type { RootState } from 'store';
import { FetchStatus } from 'store/common';
import { rosActions, rosSelectors } from 'store/ros';

// Default sort: cpu_variation_short_cost DESC surfaces the biggest resource changes.
// When the backend adds estimated_monthly_savings support for namespaces, the UI
// should attempt that sort first and fall back to variation when all savings are null.
export const namespaceRecommendationsBaseQuery: RosQuery = {
  limit: 10,
  offset: 0,
  order_by: {
    cpu_variation_short_cost: 'desc',
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

  useEffect(() => {
    if (skipFetch || reportError || reportFetchStatus === FetchStatus.inProgress) {
      return;
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
