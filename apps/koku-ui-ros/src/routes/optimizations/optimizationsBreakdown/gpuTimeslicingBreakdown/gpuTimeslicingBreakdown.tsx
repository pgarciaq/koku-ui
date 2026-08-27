import '../optimizationsBreakdown.scss';

import { Alert, Content, ContentVariants, Label, PageSection, Title, TitleSizes } from '@patternfly/react-core';
import {
  encodeGpuTimeslicingDetailFetchQuery,
  type GPUTimeslicingRecommendationReport,
} from 'api/ros/recommendations';
import { RosPathsType, RosType } from 'api/ros/ros';
import type { AxiosError } from 'axios';
import messages from 'locales/messages';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import { LoadingState } from 'routes/components/state/loadingState';
import type { RootState } from 'store';
import { FetchStatus } from 'store/common';
import { rosActions, rosSelectors } from 'store/ros';
import { breadcrumbLabelKey } from 'utils/props';

import { GpuVisualInsightsSection } from '../gpuVisualInsights';
import { styles as headerStyles } from '../optimizationsBreakdownHeader.styles';
import { styles } from '../optimizationsBreakdown.styles';
import { PeakHoursMetricTable, PeakHoursSizingCard } from '../shared/peakHoursSizing';
import { hasTimeslicingBhSizing, nestWarningMessage, pickGpuTimeslicingItem } from '../shared/peakHoursUtils';

interface GpuTimeslicingBreakdownOwnProps {
  linkState?: any;
  projectPath?: string;
  queryStateName: string;
}

interface GpuTimeslicingBreakdownMapProps {
  queryStateName: string;
}

interface GpuTimeslicingBreakdownStateProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  gpuModel?: string;
  report?: GPUTimeslicingRecommendationReport;
  reportError?: AxiosError;
  reportFetchStatus?: FetchStatus;
  term?: string;
}

type GpuTimeslicingBreakdownProps = GpuTimeslicingBreakdownOwnProps;

const classificationColorMap: Record<string, 'blue' | 'green' | 'orange' | 'red' | 'grey'> = {
  rightsized: 'green',
  oversized: 'orange',
  undersized: 'blue',
  idle: 'red',
};

const GpuTimeslicingBreakdown: React.FC<GpuTimeslicingBreakdownProps> = ({ linkState, queryStateName }) => {
  const { breadcrumbLabel, breadcrumbPath, gpuModel, report, reportFetchStatus, term } = useMapToProps({
    queryStateName,
  });
  const intl = useIntl();

  const item = pickGpuTimeslicingItem(report?.data, gpuModel, term);

  const getHeader = () => {
    const nodeName = item?.node_name ?? '—';
    const clusterUuid = item?.cluster_uuid ?? '—';
    const gpuModel = item?.gpu_model ?? '—';
    const classification = item?.classification;
    const confidence = item?.confidence_level;
    const recommendedReplicas = item?.recommended_replicas;
    const savings = item?.estimated_monthly_savings;
    const savingsDisplay =
      savings?.value != null ? `$${Number(savings.value).toFixed(2)} ${savings.units ?? 'USD'}` : '—';

    return (
      <header>
        <Link to={breadcrumbPath} state={{ ...linkState }}>
          {breadcrumbLabel ? breadcrumbLabel : intl.formatMessage(messages.breakdownBackToOptimizations)}
        </Link>
        <div style={headerStyles.title}>
          <Title headingLevel="h1" size={TitleSizes['2xl']}>
            {nodeName}
          </Title>
          {classification && (
            <Label color={classificationColorMap[classification] ?? 'grey'} isCompact style={{ marginLeft: 8 }}>
              {classification}
            </Label>
          )}
        </div>
        <div style={headerStyles.description}>
          <Content>
            <Content component={ContentVariants.dl} style={headerStyles.metadataList}>
              <Content component={ContentVariants.dt}>{intl.formatMessage(messages.gpuTimeslicingColumnCluster)}</Content>
              <Content component={ContentVariants.dd}>{clusterUuid}</Content>

              <Content component={ContentVariants.dt}>{intl.formatMessage(messages.gpuTimeslicingColumnGpuModel)}</Content>
              <Content component={ContentVariants.dd}>{gpuModel}</Content>

              <Content component={ContentVariants.dt}>
                {intl.formatMessage(messages.gpuTimeslicingColumnRecommendedReplicas)}
              </Content>
              <Content component={ContentVariants.dd}>{recommendedReplicas ?? '—'}</Content>

              {confidence != null && (
                <>
                  <Content component={ContentVariants.dt}>{intl.formatMessage(messages.gpuMigColumnConfidence)}</Content>
                  <Content component={ContentVariants.dd}>
                    <Label
                      color={confidence >= 0.7 ? 'green' : confidence >= 0.4 ? 'orange' : 'red'}
                      isCompact
                    >
                      {String(confidence)}
                    </Label>
                  </Content>
                </>
              )}

              <Content component={ContentVariants.dt}>{intl.formatMessage(messages.gpuTimeslicingColumnSavings)}</Content>
              <Content component={ContentVariants.dd}>{savingsDisplay}</Content>
            </Content>
          </Content>
        </div>
      </header>
    );
  };

  const getCandidateContainersTable = () => {
    const candidates = item?.candidate_containers;
    if (!candidates || candidates.length === 0) {
      return (
        <Alert isInline variant="info" title={intl.formatMessage(messages.gpuTimeslicingNoCandidates)} />
      );
    }

    const cellStyle = {
      padding: '8px',
      borderBottom: '1px solid var(--pf-t--global--border--color--default)',
    };
    const headerCellStyle = {
      ...cellStyle,
      borderBottom: '2px solid var(--pf-t--global--border--color--default)',
    };

    return (
      <>
        <Title headingLevel="h3" size={TitleSizes.lg} style={{ marginBottom: 12, marginTop: 24 }}>
          {intl.formatMessage(messages.gpuTimeslicingCandidateContainers)}
        </Title>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...headerCellStyle, textAlign: 'left' }}>
                {intl.formatMessage(messages.gpuMigColumnNamespace)}
              </th>
              <th style={{ ...headerCellStyle, textAlign: 'left' }}>
                {intl.formatMessage(messages.gpuMigColumnWorkload)}
              </th>
              <th style={{ ...headerCellStyle, textAlign: 'left' }}>
                {intl.formatMessage(messages.gpuMigColumnContainer)}
              </th>
              <th style={{ ...headerCellStyle, textAlign: 'right' }}>
                {intl.formatMessage(messages.gpuTimeslicingSmActiveAvg)}
              </th>
              <th style={{ ...headerCellStyle, textAlign: 'left' }}>
                {intl.formatMessage(messages.gpuMigColumnClassification)}
              </th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c, idx) => (
              <tr key={idx}>
                <td style={cellStyle}>{c.namespace ?? '—'}</td>
                <td style={cellStyle}>{c.workload ?? '—'}</td>
                <td style={cellStyle}>{c.container ?? '—'}</td>
                <td style={{ ...cellStyle, textAlign: 'right' }}>
                  {c.sm_active_avg != null ? `${(c.sm_active_avg * 100).toFixed(1)}%` : '—'}
                </td>
                <td style={cellStyle}>
                  {c.classification ? (
                    <Label color={classificationColorMap[c.classification] ?? 'grey'} isCompact>
                      {c.classification}
                    </Label>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  const isLoading = reportFetchStatus === FetchStatus.inProgress;

  return (
    <>
      <PageSection style={styles.headerContainer}>
        {isLoading ? null : getHeader()}
      </PageSection>
      <PageSection>
        {isLoading ? (
          <LoadingState
            body={intl.formatMessage(messages.optimizationsLoadingStateDesc)}
            heading={intl.formatMessage(messages.optimizationsLoadingStateTitle)}
          />
        ) : !item ? (
          <Alert isInline variant="info" title={intl.formatMessage(messages.optimizationsNoRecommendations)} />
        ) : (
          <>
            {hasTimeslicingBhSizing(item.business_hours) ? (
              <div style={{ marginBottom: 24 }}>
                <PeakHoursSizingCard warning={nestWarningMessage(item.business_hours.notifications)}>
                  <PeakHoursMetricTable
                    rows={[
                      {
                        metric: intl.formatMessage(messages.gpuTimeslicingColumnRecommendedReplicas),
                        value:
                          item.business_hours.recommended_replicas != null
                            ? String(item.business_hours.recommended_replicas)
                            : '—',
                      },
                    ]}
                  />
                </PeakHoursSizingCard>
              </div>
            ) : null}
            {getCandidateContainersTable()}
            <GpuVisualInsightsSection
              dramActiveAvg={item?.dram_active_avg}
              fbUsageMaxMib={item?.fb_usage_max_mib}
              peakHours={
                hasTimeslicingBhSizing(item.business_hours)
                  ? {
                      dramActiveAvg: item.business_hours?.dram_active_avg,
                      fbUsageMaxMib: item.business_hours?.fb_usage_max_mib,
                      smActiveAvg: item.business_hours?.sm_active_avg,
                      tensorPipeActiveAvg: item.business_hours?.tensor_pipe_active_avg,
                      totalFbMib: item.business_hours?.total_fb_mib ?? item.total_fb_mib,
                    }
                  : undefined
              }
              showPeakHoursCharts={hasTimeslicingBhSizing(item.business_hours)}
              smActiveAvg={item?.sm_active_avg}
              tensorPipeActiveAvg={item?.tensor_pipe_active_avg}
              totalFbMib={item?.total_fb_mib}
            />
          </>
        )}
      </PageSection>
    </>
  );
};

const useMapToProps = ({ queryStateName }: GpuTimeslicingBreakdownMapProps): GpuTimeslicingBreakdownStateProps => {
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const location = useLocation();
  const listQueryState = location?.state?.[queryStateName] ?? {};

  const queryFromRoute = new URLSearchParams(location.search);
  const clusterUuid = queryFromRoute.get('cluster_uuid') ?? listQueryState.cluster_uuid ?? '';
  const nodeName = queryFromRoute.get('node_name') ?? listQueryState.node_name ?? '';
  const gpuModel = queryFromRoute.get('gpu_model') ?? listQueryState.gpu_model ?? '';
  const term = queryFromRoute.get('term') ?? listQueryState.term ?? '';

  const queryString = encodeGpuTimeslicingDetailFetchQuery({
    node_name: nodeName,
    cluster_uuid: clusterUuid || undefined,
    gpu_model: gpuModel || undefined,
    term: term || undefined,
  });
  const reportPathsType = RosPathsType.gpuTimeslicingRecommendation as any;

  const report = useSelector((state: RootState) =>
    rosSelectors.selectRos(state, reportPathsType, RosType.ros as any, queryString)
  ) as GPUTimeslicingRecommendationReport | undefined;
  const reportFetchStatus = useSelector((state: RootState) =>
    rosSelectors.selectRosFetchStatus(state, reportPathsType, RosType.ros as any, queryString)
  );
  const reportError = useSelector((state: RootState) =>
    rosSelectors.selectRosError(state, reportPathsType, RosType.ros as any, queryString)
  );

  useEffect(() => {
    if (clusterUuid && nodeName && !reportError && reportFetchStatus !== FetchStatus.inProgress) {
      dispatch(rosActions.fetchRosReport(reportPathsType, RosType.ros as any, queryString));
    }
  }, [queryString]);

  const query = new URLSearchParams(location.search);

  return {
    breadcrumbLabel: query.get(breadcrumbLabelKey) ?? listQueryState.breadcrumbLabel,
    breadcrumbPath: listQueryState.breadcrumbPath,
    gpuModel: gpuModel || undefined,
    report,
    reportError,
    reportFetchStatus,
    term: term || undefined,
  };
};

export default GpuTimeslicingBreakdown;
