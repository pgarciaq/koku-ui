import '../optimizationsBreakdown.scss';

import { Alert, List, ListItem, PageSection } from '@patternfly/react-core';
import type { Query } from 'api/queries/query';
import { parseQuery } from 'api/queries/query';
import type { ClusterQuotaRecommendationDetailResponse } from 'api/ros/recommendations';
import { encodeClusterQuotaDetailFetchQuery } from 'api/ros/recommendations';
import { RosPathsType, RosType } from 'api/ros/ros';
import messages from 'locales/messages';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import { LoadingState } from 'routes/components/state/loadingState';
import { QuotaResourceBreakdown } from 'routes/optimizations/optimizationsTable/quotaResourceBreakdown';
import type { RootState } from 'store';
import { FetchStatus } from 'store/common';
import { rosActions, rosSelectors } from 'store/ros';
import { breadcrumbLabelKey } from 'utils/props';

import { styles } from '../optimizationsBreakdown.styles';
import { QuotaBreakdownHistoryCharts } from '../quotaBreakdown/quotaBreakdownHistoryCharts';
import { ClusterQuotaBreakdownHeader } from './clusterQuotaBreakdownHeader';
import { ClusterQuotaBreakdownExplanation } from './clusterQuotaBreakdownExplanation';
import { ClusterQuotaVisualInsightsSection } from './clusterQuotaVisualInsightsSection';

interface ClusterQuotaBreakdownOwnProps {
  linkState?: any;
  queryStateName: string;
}

const reportType = RosType.ros as any;
const reportPathsType = RosPathsType.clusterQuotaRecommendation as any;

const ClusterQuotaBreakdown: React.FC<ClusterQuotaBreakdownOwnProps> = ({ linkState, queryStateName }) => {
  const intl = useIntl();
  const { breadcrumbLabel, breadcrumbPath, report, reportFetchStatus } = useMapToProps({ queryStateName });
  const detail = report as ClusterQuotaRecommendationDetailResponse | undefined;

  const getNotificationAlert = () => {
    const notifications = detail?.notifications ? Object.values(detail.notifications) : [];
    if (notifications.length === 0) {
      return null;
    }
    return (
      <div style={styles.alertContainer}>
        <Alert isInline title={intl.formatMessage(messages.notificationsAlertTitle)} variant="warning">
          <List>
            {notifications.map((notification, index) => (
              <ListItem key={index}>{notification.message}</ListItem>
            ))}
          </List>
        </Alert>
      </div>
    );
  };

  if (reportFetchStatus !== FetchStatus.complete) {
    return (
      <LoadingState
        body={intl.formatMessage(messages.optimizationsLoadingStateDesc)}
        heading={intl.formatMessage(messages.optimizationsLoadingStateTitle)}
      />
    );
  }

  if (!detail) {
    return null;
  }

  return (
    <>
      <PageSection style={styles.headerContainer}>
        <ClusterQuotaBreakdownHeader
          breadcrumbLabel={breadcrumbLabel}
          breadcrumbPath={breadcrumbPath}
          detail={detail}
          linkState={linkState}
        />
      </PageSection>
      <PageSection>
        {getNotificationAlert()}
        <ClusterQuotaBreakdownExplanation explanation={detail.explanation} />
        <div style={{ marginBottom: 24 }}>
          <QuotaResourceBreakdown
            hard={detail.quota_hard}
            recommended={detail.quota_recommended}
            title={intl.formatMessage(messages.quotaResourceBreakdown)}
            used={detail.quota_used}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <ClusterQuotaVisualInsightsSection
            explanation={detail.explanation}
            quotaHard={detail.quota_hard}
            quotaUsed={detail.quota_used}
            utilization={detail.utilization}
          />
        </div>
        <QuotaBreakdownHistoryCharts history={detail.history} />
      </PageSection>
    </>
  );
};

const useQueryFromRoute = () => {
  const location = useLocation();
  return parseQuery<Query>(location.search);
};

const useMapToProps = ({ queryStateName }: { queryStateName: string }) => {
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const queryFromRoute = useQueryFromRoute();
  const location = useLocation();
  const listQueryState = location?.state?.[queryStateName] ?? {};

  const clusterUuid = (queryFromRoute as any)?.cluster_uuid ?? listQueryState.cluster_uuid;
  const clusterQuotaName = queryFromRoute?.id ?? listQueryState.cluster_quota_name;
  const term = listQueryState.term;
  const engine = listQueryState.engine;

  const reportQueryString = encodeClusterQuotaDetailFetchQuery({
    cluster_uuid: clusterUuid,
    cluster_quota_name: clusterQuotaName,
    term,
    engine,
  });

  const report: any = useSelector((state: RootState) =>
    rosSelectors.selectRos(state, reportPathsType, reportType, reportQueryString)
  );
  const reportFetchStatus = useSelector((state: RootState) =>
    rosSelectors.selectRosFetchStatus(state, reportPathsType, reportType, reportQueryString)
  );
  const reportError = useSelector((state: RootState) =>
    rosSelectors.selectRosError(state, reportPathsType, reportType, reportQueryString)
  );

  useEffect(() => {
    if (!reportError && reportFetchStatus !== FetchStatus.inProgress && clusterUuid && clusterQuotaName) {
      dispatch(rosActions.fetchRosReport(reportPathsType, reportType, reportQueryString));
    }
  }, [clusterQuotaName, clusterUuid, dispatch, reportError, reportFetchStatus, reportQueryString]);

  return {
    breadcrumbLabel: queryFromRoute[breadcrumbLabelKey],
    breadcrumbPath: listQueryState.breadcrumbPath,
    report,
    reportFetchStatus,
  };
};

export default ClusterQuotaBreakdown;
