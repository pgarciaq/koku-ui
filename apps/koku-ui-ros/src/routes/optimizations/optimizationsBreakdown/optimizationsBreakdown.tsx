import './optimizationsBreakdown.scss';

import { Alert, List, ListItem, PageSection } from '@patternfly/react-core';
import type { Query } from 'api/queries/query';
import { parseQuery } from 'api/queries/query';
import type { RecommendationReportData } from 'api/ros/recommendations';
import { RosPathsType, RosType } from 'api/ros/ros';
import { encodeRosDetailFetchQuery } from 'api/ros/rosListParams';
import type { AxiosError } from 'axios';
import { useIsBoxPlotToggleEnabled } from 'components/featureToggle';
import messages from 'locales/messages';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import { LoadingState } from 'routes/components/state/loadingState';
import type { RootState } from 'store';
import { FetchStatus } from 'store/common';
import { rosActions, rosSelectors } from 'store/ros';
import { getNotifications } from 'utils/notifications';
import { breadcrumbLabelKey } from 'utils/props';
import { getRecommendationTerm } from 'utils/recomendations';

import { useRecommendationHistory } from 'hooks/useRecommendationHistory';
import { styles } from './optimizationsBreakdown.styles';
import { OptimizationsBreakdownConfiguration } from './optimizationsBreakdownConfiguration';
import { OptimizationsBreakdownExplanation } from './optimizationsBreakdownExplanation';
import { OptimizationsBreakdownHeader } from './optimizationsBreakdownHeader';
import { OptimizationsBreakdownUtilization } from './optimizationsBreakdownUtilization';
import { BreakdownDecayInfoCard } from './shared/breakdownDecayInfoCard';
import { useBreakdownProjection } from './useBreakdownProjection';
import { VisualInsightsSection } from './visualInsights';

interface OptimizationsBreakdownOwnProps {
  linkState?: any;
  projectPath?: string;
  queryStateName: string;
}

interface OptimizationsBreakdownMapProps {
  queryStateName: string;
}

interface OptimizationsBreakdownStateProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  isBoxPlotToggleEnabled?: boolean;
  report?: RecommendationReportData;
  reportError?: AxiosError;
  reportFetchStatus?: FetchStatus;
  reportQueryString?: string;
}

type OptimizationsBreakdownProps = OptimizationsBreakdownOwnProps & OptimizationsBreakdownStateProps;

const reportType = RosType.ros as any;
const reportPathsType = RosPathsType.recommendation as any;

const OptimizationsBreakdown: React.FC<OptimizationsBreakdownProps> = ({ linkState, projectPath, queryStateName }) => {
  const { breadcrumbLabel, breadcrumbPath, isBoxPlotToggleEnabled, report, reportFetchStatus } = useMapToProps({
    queryStateName,
  });
  const { term, engine } = useBreakdownProjection(queryStateName);
  const queryFromRoute = useQueryFromRoute();
  const intl = useIntl();

  const historyParams =
    report?.cluster_uuid && report?.project && report?.workload && report?.container
      ? {
          cluster: report.cluster_uuid,
          project: report.project,
          workload: report.workload,
          container: report.container,
          term,
          engine,
        }
      : null;
  const { data: historyResponse, fetchStatus: historyFetchStatus } = useRecommendationHistory(historyParams);

  const getIdleCallout = () => {
    const idleState = (report as any)?.idle_state;
    if (!idleState || idleState === 'active') {
      return null;
    }
    const idleRec = (report as any)?.idle_recommendation;
    return (
      <div style={styles.alertContainer}>
        <Alert
          isInline
          variant={idleState === 'zombie' ? 'danger' : 'warning'}
          title={intl.formatMessage(messages.idleCalloutTitle)}
        >
          <List>
            {idleRec?.action && (
              <ListItem>{intl.formatMessage(messages.idleCalloutAction, { action: idleRec.action })}</ListItem>
            )}
            {idleRec?.confidence && (
              <ListItem>
                {intl.formatMessage(messages.idleCalloutConfidence, { confidence: idleRec.confidence })}
              </ListItem>
            )}
            {idleRec?.reason && (
              <ListItem>{intl.formatMessage(messages.idleCalloutReason, { reason: idleRec.reason })}</ListItem>
            )}
          </List>
        </Alert>
      </div>
    );
  };

  const getDataQualityAlert = () => {
    const analyticsIncomplete = (report as any)?.analytics_incomplete;
    const ingestHooksFailed = (report as any)?.ingest_hooks_failed;
    if (!analyticsIncomplete && !ingestHooksFailed) {
      return null;
    }
    return (
      <div style={styles.alertContainer}>
        <Alert isInline variant="warning" title={intl.formatMessage(messages.dataQualityIncomplete)}>
          <List>
            {analyticsIncomplete && <ListItem>{intl.formatMessage(messages.dataQualityIncomplete)}</ListItem>}
            {ingestHooksFailed && <ListItem>{intl.formatMessage(messages.dataQualityIngestFailed)}</ListItem>}
          </List>
        </Alert>
      </div>
    );
  };

  const getAlert = () => {
    const notifications = getNotifications(report?.recommendations, term, engine);

    if (notifications.length === 0) {
      return null;
    }
    return (
      <div style={styles.alertContainer}>
        <Alert isInline variant="warning" title={intl.formatMessage(messages.notificationsAlertTitle)}>
          <List>
            {notifications?.map((notification, index) => (
              <ListItem key={index}>{notification.message}</ListItem>
            ))}
          </List>
        </Alert>
      </div>
    );
  };

  const getBreakdownContent = () => {
    const recommendationTerm = getRecommendationTerm(report?.recommendations, term);
    const plotsData = recommendationTerm?.plots?.plots_data;
    const recommendationEngine = recommendationTerm?.recommendation_engines?.[engine];
    const recommendationId = queryFromRoute?.id as string;

    return (
      <>
        <OptimizationsBreakdownConfiguration
          currentInterval={term}
          optimizationType={engine}
          recommendations={report?.recommendations}
        />
        {plotsData && isBoxPlotToggleEnabled && (
          <div style={styles.utilizationContainer}>
            <OptimizationsBreakdownUtilization
              currentInterval={term}
              optimizationType={engine}
              recommendations={report?.recommendations}
            />
          </div>
        )}
        <OptimizationsBreakdownExplanation explanation={recommendationEngine?.explanation} />
        <BreakdownDecayInfoCard recommendationType="container" term={term} />
        {recommendationId && (
          <div style={styles.utilizationContainer}>
            <VisualInsightsSection
              plotsData={plotsData}
              recommendationId={recommendationId}
              historyData={historyResponse?.data}
              historyFetchStatus={historyFetchStatus}
            />
          </div>
        )}
      </>
    );
  };

  const isLoading = reportFetchStatus === FetchStatus.inProgress;

  return (
    <>
      <PageSection style={styles.headerContainer}>
        <OptimizationsBreakdownHeader
          breadcrumbLabel={breadcrumbLabel}
          breadcrumbPath={breadcrumbPath}
          linkState={linkState}
          projectPath={projectPath}
          report={report}
        />
      </PageSection>
      <PageSection>
        {isLoading ? (
          <LoadingState
            body={intl.formatMessage(messages.optimizationsLoadingStateDesc)}
            heading={intl.formatMessage(messages.optimizationsLoadingStateTitle)}
          />
        ) : (
          <div>
            {getIdleCallout()}
            {getDataQualityAlert()}
            {getAlert()}
            {getBreakdownContent()}
          </div>
        )}
      </PageSection>
    </>
  );
};

const useQueryFromRoute = () => {
  const location = useLocation();
  return parseQuery<Query>(location.search);
};

const useMapToProps = ({ queryStateName }: OptimizationsBreakdownMapProps): OptimizationsBreakdownStateProps => {
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const queryFromRoute = useQueryFromRoute();
  const location = useLocation();
  const listQueryState = location?.state?.[queryStateName] ?? {};

  const reportQueryString = encodeRosDetailFetchQuery({
    id: queryFromRoute ? queryFromRoute.id : '',
    term: listQueryState.term,
    engine: listQueryState.engine,
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
    if (!reportError && reportFetchStatus !== FetchStatus.inProgress) {
      dispatch(rosActions.fetchRosReport(reportPathsType, reportType, reportQueryString));
    }
  }, [reportQueryString]);

  return {
    breadcrumbLabel: queryFromRoute[breadcrumbLabelKey],
    breadcrumbPath: location?.state?.[queryStateName]?.breadcrumbPath,
    isBoxPlotToggleEnabled: useIsBoxPlotToggleEnabled(),
    report,
    reportError,
    reportFetchStatus,
    reportQueryString,
  };
};

export default OptimizationsBreakdown;
