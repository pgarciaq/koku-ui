import '../optimizationsBreakdown.scss';

import { Alert, List, ListItem, PageSection } from '@patternfly/react-core';
import type { Query } from 'api/queries/query';
import { parseQuery } from 'api/queries/query';
import type { NodeRecommendationData } from 'api/ros/recommendations';
import { RosPathsType, RosType } from 'api/ros/ros';
import { encodeRosDetailFetchQuery } from 'api/ros/rosListParams';
import type { AxiosError } from 'axios';
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
import { breadcrumbLabelKey } from 'utils/props';

import { styles } from '../optimizationsBreakdown.styles';
import { useBreakdownProjection } from '../useBreakdownProjection';
import { NodeBreakdownExplanation } from './nodeBreakdownExplanation';
import { NodeBreakdownHeader } from './nodeBreakdownHeader';
import { NodeBreakdownUtilization } from './nodeBreakdownUtilization';
import { NodeVisualInsightsSection } from './nodeVisualInsightsSection';

interface NodeBreakdownOwnProps {
  linkState?: any;
  projectPath?: string;
  queryStateName: string;
}

interface NodeBreakdownMapProps {
  queryStateName: string;
}

interface NodeBreakdownStateProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  report?: NodeRecommendationData;
  reportError?: AxiosError;
  reportFetchStatus?: FetchStatus;
  reportQueryString?: string;
}

type NodeBreakdownProps = NodeBreakdownOwnProps & NodeBreakdownStateProps;

const reportType = RosType.ros as any;
const reportPathsType = RosPathsType.nodeRecommendation as any;

const NodeBreakdown: React.FC<NodeBreakdownProps> = ({ linkState, queryStateName }) => {
  const { breadcrumbLabel, breadcrumbPath, report, reportFetchStatus } = useMapToProps({
    queryStateName,
  });
  const { term, engine } = useBreakdownProjection(queryStateName);
  const intl = useIntl();

  const getNotificationAlert = () => {
    const notifications = (report as any)?.notifications;
    if (!notifications || Object.keys(notifications).length === 0) {
      return null;
    }
    return (
      <div style={styles.alertContainer}>
        <Alert isInline variant="warning" title={intl.formatMessage(messages.notificationsAlertTitle)}>
          <List>
            {Object.values(notifications).map((n: any, index) => (
              <ListItem key={index}>{n.message}</ListItem>
            ))}
          </List>
        </Alert>
      </div>
    );
  };

  const getClassificationRationale = () => {
    if (!report?.instance_type_reason) {
      return null;
    }
    return (
      <div style={styles.alertContainer}>
        <Alert isInline variant="info" title={intl.formatMessage(messages.nodeClassificationRationaleTitle)}>
          {report.instance_type_reason}
        </Alert>
      </div>
    );
  };

  const getBreakdownContent = () => {
    const termData = report?.recommendation_terms?.[term];
    const recommendationEngine = termData?.recommendation_engines?.[engine];

    if (!recommendationEngine) {
      return (
        <div style={styles.alertContainer}>
          <Alert isInline variant="info" title={intl.formatMessage(messages.optimizationsNoRecommendations)} />
        </div>
      );
    }

    return (
      <div style={{ padding: '16px 0' }}>
        <div style={{ marginBottom: 24 }}>
          <NodeBreakdownUtilization metrics={report?.metrics} />
        </div>
        {(report?.pod_capacity > 0 || (report as any)?.daily_digests?.length > 0 || report?.cluster_uuid) && (
          <div style={{ marginBottom: 24 }}>
            <NodeVisualInsightsSection
              clusterUuid={report?.cluster_uuid}
              dailyDigests={(report as any)?.daily_digests}
              lastReported={(report as any)?.last_reported}
              nodeName={report?.node}
              podCapacity={report.pod_capacity}
              podCount={report?.pod_count ?? 0}
              targetUtilizationBP={recommendationEngine?.explanation?.target_utilization_basis_points}
            />
          </div>
        )}
        <NodeEngineDetails engine={recommendationEngine} intl={intl} />
        <div style={{ marginTop: 16 }}>
          <NodeBreakdownExplanation explanation={recommendationEngine.explanation} />
        </div>
      </div>
    );
  };

  const isLoading = reportFetchStatus === FetchStatus.inProgress;

  return (
    <>
      <PageSection style={styles.headerContainer}>
        <NodeBreakdownHeader
          breadcrumbLabel={breadcrumbLabel}
          breadcrumbPath={breadcrumbPath}
          engine={engine}
          linkState={linkState}
          report={report}
          term={term}
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
            {getNotificationAlert()}
            {getClassificationRationale()}
            {getBreakdownContent()}
          </div>
        )}
      </PageSection>
    </>
  );
};

const NodeEngineDetails: React.FC<{ engine: any; intl: any }> = ({ engine, intl }) => {
  const formatValue = (value: number | undefined, unit: string) => {
    if (value == null) return '—';
    return `${value.toFixed(2)} ${unit}`;
  };

  const explanation = engine.explanation;
  const currentCpuCores =
    explanation?.current_cpu_millicores != null ? explanation.current_cpu_millicores / 1000 : undefined;
  const currentMemGiB =
    explanation?.current_mem_kib != null ? explanation.current_mem_kib / (1024 * 1024) : undefined;
  const hasCurrentValues = currentCpuCores != null || currentMemGiB != null;

  const savings = engine.estimated_monthly_savings;
  const savingsDisplay =
    savings?.value != null ? `$${Number(savings.value).toFixed(2)} ${savings.units ?? 'USD'}` : '—';

  const cellStyle = {
    padding: '8px',
    borderBottom: '1px solid var(--pf-t--global--border--color--default)',
  };
  const headerStyle = {
    ...cellStyle,
    borderBottom: '2px solid var(--pf-t--global--border--color--default)',
  };

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...headerStyle, textAlign: 'left' }}>{intl.formatMessage(messages.metric)}</th>
            {hasCurrentValues && (
              <th style={{ ...headerStyle, textAlign: 'right' }}>{intl.formatMessage(messages.current)}</th>
            )}
            <th style={{ ...headerStyle, textAlign: 'right' }}>{intl.formatMessage(messages.recommended)}</th>
            {hasCurrentValues && (
              <th style={{ ...headerStyle, textAlign: 'right' }}>{intl.formatMessage(messages.change)}</th>
            )}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={cellStyle}>CPU Cores</td>
            {hasCurrentValues && (
              <td style={{ ...cellStyle, textAlign: 'right' }}>{formatValue(currentCpuCores, 'cores')}</td>
            )}
            <td style={{ ...cellStyle, textAlign: 'right' }}>
              {formatValue(engine.recommended_cpu_cores, 'cores')}
            </td>
            {hasCurrentValues && (
              <td style={{ ...cellStyle, textAlign: 'right' }}>
                {currentCpuCores != null && engine.recommended_cpu_cores != null
                  ? formatValue(engine.recommended_cpu_cores - currentCpuCores, 'cores')
                  : '—'}
              </td>
            )}
          </tr>
          <tr>
            <td style={cellStyle}>Memory</td>
            {hasCurrentValues && (
              <td style={{ ...cellStyle, textAlign: 'right' }}>{formatValue(currentMemGiB, 'GiB')}</td>
            )}
            <td style={{ ...cellStyle, textAlign: 'right' }}>
              {formatValue(engine.recommended_memory_gib, 'GiB')}
            </td>
            {hasCurrentValues && (
              <td style={{ ...cellStyle, textAlign: 'right' }}>
                {currentMemGiB != null && engine.recommended_memory_gib != null
                  ? formatValue(engine.recommended_memory_gib - currentMemGiB, 'GiB')
                  : '—'}
              </td>
            )}
          </tr>
          {engine.node_count_reduction != null && engine.node_count_reduction > 0 && (
            <tr>
              <td style={cellStyle}>{intl.formatMessage(messages.nodeCountReduction)}</td>
              {hasCurrentValues && <td style={{ ...cellStyle, textAlign: 'right' }}>—</td>}
              <td style={{ ...cellStyle, textAlign: 'right' }}>{engine.node_count_reduction}</td>
              {hasCurrentValues && <td style={{ ...cellStyle, textAlign: 'right' }}>—</td>}
            </tr>
          )}
          <tr>
            <td style={cellStyle}>{intl.formatMessage(messages.savingsEstimatedMonthly)}</td>
            {hasCurrentValues && <td style={{ ...cellStyle, textAlign: 'right' }}>—</td>}
            <td style={{ ...cellStyle, textAlign: 'right' }}>{savingsDisplay}</td>
            {hasCurrentValues && <td style={{ ...cellStyle, textAlign: 'right' }}>—</td>}
          </tr>
        </tbody>
      </table>
      {engine.notifications && Object.keys(engine.notifications).length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Alert isInline variant="info" title={intl.formatMessage(messages.notificationsAlertTitle)}>
            <List>
              {Object.values(engine.notifications).map((n: any, idx) => (
                <ListItem key={idx}>{n.message}</ListItem>
              ))}
            </List>
          </Alert>
        </div>
      )}
    </div>
  );
};

const useQueryFromRoute = () => {
  const location = useLocation();
  return parseQuery<Query>(location.search);
};

const useMapToProps = ({ queryStateName }: NodeBreakdownMapProps): NodeBreakdownStateProps => {
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
    report,
    reportError,
    reportFetchStatus,
    reportQueryString,
  };
};

export default NodeBreakdown;
