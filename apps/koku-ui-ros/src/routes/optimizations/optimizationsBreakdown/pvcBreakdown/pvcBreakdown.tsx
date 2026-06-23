import '../optimizationsBreakdown.scss';

import { Alert, List, ListItem, PageSection } from '@patternfly/react-core';
import type { Query } from 'api/queries/query';
import { parseQuery } from 'api/queries/query';
import type { PvcRecommendationDetailResponse } from 'api/ros/recommendations';
import { encodePvcDetailFetchQuery } from 'api/ros/recommendations';
import { RosPathsType, RosType } from 'api/ros/ros';
import messages from 'locales/messages';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import { LoadingState } from 'routes/components/state/loadingState';
import { termToApiKey } from 'routes/optimizations/optimizationsTable/storageTableUtils';
import type { RecommendationTermName } from 'routes/optimizations/optimizationsTable/recommendationTermLabels';
import type { RootState } from 'store';
import { FetchStatus } from 'store/common';
import { rosActions, rosSelectors } from 'store/ros';
import { breadcrumbLabelKey } from 'utils/props';

import { styles } from '../optimizationsBreakdown.styles';
import { useBreakdownProjection } from '../useBreakdownProjection';
import { PvcBreakdownExplanation } from './pvcBreakdownExplanation';
import { PvcBreakdownHeader } from './pvcBreakdownHeader';
import { PvcBreakdownTermCards } from './pvcBreakdownTermCards';
import { PvcBreakdownUsageChart } from './pvcBreakdownUsageChart';

interface PvcBreakdownOwnProps {
  linkState?: any;
  queryStateName: string;
}

const reportType = RosType.ros as any;
const reportPathsType = RosPathsType.pvcRecommendation as any;

const PvcBreakdown: React.FC<PvcBreakdownOwnProps> = ({ linkState, queryStateName }) => {
  const intl = useIntl();
  const { term } = useBreakdownProjection(queryStateName);
  const activeTermKey = termToApiKey(term);
  const { breadcrumbLabel, breadcrumbPath, report, reportFetchStatus } = useMapToProps({ queryStateName });
  const detail = report as PvcRecommendationDetailResponse | undefined;
  const termRec = detail?.terms?.[activeTermKey] ?? detail?.terms?.medium;

  const getNotificationAlert = () => {
    const notifications = termRec?.notifications ? Object.values(termRec.notifications) : [];
    if (notifications.length === 0) {
      return null;
    }
    return (
      <div style={styles.alertContainer}>
        <Alert isInline variant="warning" title={intl.formatMessage(messages.notificationsAlertTitle)}>
          <List>
            {notifications.map((notification, index) => (
              <ListItem key={index}>{notification.message}</ListItem>
            ))}
          </List>
        </Alert>
      </div>
    );
  };

  const getResizeNote = () => {
    if (!termRec?.resize_note) {
      return null;
    }
    return (
      <div style={styles.alertContainer}>
        <Alert isInline variant="info" title={intl.formatMessage(messages.pvcResizeNoteTitle)}>
          {termRec.resize_note}
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
        <PvcBreakdownHeader
          activeTermKey={activeTermKey}
          breadcrumbLabel={breadcrumbLabel}
          breadcrumbPath={breadcrumbPath}
          detail={detail}
          linkState={linkState}
          termRec={termRec}
        />
      </PageSection>
      <PageSection>
        {getNotificationAlert()}
        {getResizeNote()}
        <div style={{ marginBottom: 24 }}>
          <PvcBreakdownTermCards activeTermKey={activeTermKey} terms={detail.terms} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <PvcBreakdownUsageChart historicalUsage={detail.historical_usage} />
        </div>
        <PvcBreakdownExplanation termName={activeTermKey as RecommendationTermName} termRec={termRec} />
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
  const pvcName = queryFromRoute?.id ?? listQueryState.persistentvolumeclaim;

  const reportQueryString = encodePvcDetailFetchQuery({
    cluster_uuid: clusterUuid,
    namespace,
    persistentvolumeclaim: pvcName,
    term: listQueryState.term,
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
    if (!reportError && reportFetchStatus !== FetchStatus.inProgress && clusterUuid && namespace && pvcName) {
      dispatch(rosActions.fetchRosReport(reportPathsType, reportType, reportQueryString));
    }
  }, [clusterUuid, dispatch, namespace, pvcName, reportError, reportFetchStatus, reportQueryString]);

  return {
    breadcrumbLabel: queryFromRoute[breadcrumbLabelKey],
    breadcrumbPath: listQueryState.breadcrumbPath,
    report,
    reportFetchStatus,
  };
};

export default PvcBreakdown;
