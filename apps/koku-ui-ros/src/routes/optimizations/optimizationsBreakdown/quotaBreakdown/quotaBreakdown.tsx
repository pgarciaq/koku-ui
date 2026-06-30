import '../optimizationsBreakdown.scss';

import { Alert, List, ListItem, PageSection } from '@patternfly/react-core';
import type { Query } from 'api/queries/query';
import { parseQuery } from 'api/queries/query';
import type { QuotaRecommendationDetailResponse } from 'api/ros/recommendations';
import { encodeQuotaDetailFetchQuery } from 'api/ros/recommendations';
import { RosPathsType, RosType } from 'api/ros/ros';
import messages from 'locales/messages';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import { NotAvailable } from 'routes/components/page/notAvailable';
import { LoadingState } from 'routes/components/state/loadingState';
import { QuotaResourceBreakdown } from 'routes/optimizations/optimizationsTable/quotaResourceBreakdown';
import type { RootState } from 'store';
import { FetchStatus } from 'store/common';
import { rosActions, rosSelectors } from 'store/ros';
import { breadcrumbLabelKey } from 'utils/props';

import { styles } from '../optimizationsBreakdown.styles';
import { QuotaBreakdownHeader } from './quotaBreakdownHeader';
import { QuotaBreakdownHistoryCharts } from './quotaBreakdownHistoryCharts';
import { QuotaBreakdownExplanation } from './quotaBreakdownExplanation';
import { QuotaHeadroomTrend } from './quotaHeadroomTrend';

interface QuotaBreakdownOwnProps {
  linkState?: any;
  queryStateName: string;
}

const reportType = RosType.ros as any;
const reportPathsType = RosPathsType.quotaRecommendation as any;

const normalizeQuotaName = (value?: string) => (value?.trim() ? value.trim() : undefined);

const QuotaBreakdown: React.FC<QuotaBreakdownOwnProps> = ({ linkState, queryStateName }) => {
  const intl = useIntl();
  const { breadcrumbLabel, breadcrumbPath, report, reportError, reportFetchStatus } = useMapToProps({
    queryStateName,
  });
  const detail = report as QuotaRecommendationDetailResponse | undefined;

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

  if (reportError || !detail) {
    return <NotAvailable title={intl.formatMessage(messages.quotaDetailLoadError)} />;
  }

  return (
    <>
      <PageSection style={styles.headerContainer}>
        <QuotaBreakdownHeader
          breadcrumbLabel={breadcrumbLabel}
          breadcrumbPath={breadcrumbPath}
          detail={detail}
          linkState={linkState}
        />
      </PageSection>
      <PageSection>
        {getNotificationAlert()}
        <QuotaBreakdownExplanation explanation={detail.explanation} />
        <div style={{ marginBottom: 24 }}>
          <QuotaResourceBreakdown
            hard={detail.quota_hard}
            recommended={detail.quota_recommended}
            title={intl.formatMessage(messages.quotaResourceBreakdown)}
            used={detail.quota_used}
          />
        </div>
        <QuotaBreakdownHistoryCharts history={detail.history} />
        <div style={{ marginTop: 24 }}>
          <QuotaHeadroomTrend quotaId={detail.id} />
        </div>
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
  const namespace = (queryFromRoute as any)?.namespace ?? listQueryState.namespace;
  const quotaName = normalizeQuotaName(queryFromRoute?.id ?? listQueryState.quota_name);
  const term = listQueryState.term;
  const engine = listQueryState.engine;

  const reportQueryString = encodeQuotaDetailFetchQuery({
    cluster_uuid: clusterUuid,
    namespace,
    quota_name: quotaName,
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
    if (!reportError && reportFetchStatus !== FetchStatus.inProgress && clusterUuid && namespace) {
      dispatch(rosActions.fetchRosReport(reportPathsType, reportType, reportQueryString));
    }
  }, [clusterUuid, dispatch, namespace, reportError, reportFetchStatus, reportQueryString]);

  return {
    breadcrumbLabel: queryFromRoute[breadcrumbLabelKey],
    breadcrumbPath: listQueryState.breadcrumbPath,
    report,
    reportError,
    reportFetchStatus,
  };
};

export default QuotaBreakdown;
