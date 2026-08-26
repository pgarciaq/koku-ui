import '../optimizationsBreakdown.scss';

import { Alert, Content, ContentVariants, Label, PageSection, Title, TitleSizes } from '@patternfly/react-core';
import type { GPUMIGRecommendationReport, RecommendationReportData } from 'api/ros/recommendations';
import { encodeContainerGpuLookupQuery } from 'api/ros/recommendations';
import { RosPathsType, RosType } from 'api/ros/ros';
import { encodeRosDetailFetchQuery } from 'api/ros/rosListParams';
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
import { gpuBhForTerm, hasAnyGpuBhSizing, hasGpuBhSizing, nestWarningMessage, uniqueContainerId } from '../shared/peakHoursUtils';

interface GpuMigBreakdownOwnProps {
  linkState?: any;
  projectPath?: string;
  queryStateName: string;
}

interface GpuMigBreakdownMapProps {
  queryStateName: string;
}

interface GpuMigBreakdownStateProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  containerDetail?: RecommendationReportData;
  report?: GPUMIGRecommendationReport;
  reportError?: AxiosError;
  reportFetchStatus?: FetchStatus;
}

type GpuMigBreakdownProps = GpuMigBreakdownOwnProps;

const classificationColorMap: Record<string, 'blue' | 'green' | 'orange' | 'red' | 'grey'> = {
  rightsized: 'green',
  oversized: 'orange',
  undersized: 'blue',
  idle: 'red',
};

const formatTerm = (term: string) => {
  if (!term) return '—';
  return term.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const GpuMigBreakdown: React.FC<GpuMigBreakdownProps> = ({ linkState, queryStateName }) => {
  const { breadcrumbLabel, breadcrumbPath, containerDetail, report, reportFetchStatus } = useMapToProps({
    queryStateName,
  });
  const intl = useIntl();

  const items = report?.data ?? [];
  const first = items[0];

  const getHeader = () => {
    const container = first?.container ?? '—';
    const namespace = first?.namespace ?? '—';
    const workload = first?.workload ?? '—';
    const clusterUuid = first?.cluster_uuid ?? '—';
    const gpuModel = first?.gpu_model ?? '—';
    const nodeName = first?.node_name ?? '—';

    return (
      <header>
        <Link to={breadcrumbPath} state={{ ...linkState }}>
          {breadcrumbLabel ? breadcrumbLabel : intl.formatMessage(messages.breakdownBackToOptimizations)}
        </Link>
        <div style={headerStyles.title}>
          <Title headingLevel="h1" size={TitleSizes['2xl']}>
            {container}
          </Title>
        </div>
        <div style={headerStyles.description}>
          <Content>
            <Content component={ContentVariants.dl} style={headerStyles.metadataList}>
              <Content component={ContentVariants.dt}>{intl.formatMessage(messages.gpuMigColumnCluster)}</Content>
              <Content component={ContentVariants.dd}>{clusterUuid}</Content>

              <Content component={ContentVariants.dt}>{intl.formatMessage(messages.gpuMigColumnNamespace)}</Content>
              <Content component={ContentVariants.dd}>{namespace}</Content>

              <Content component={ContentVariants.dt}>{intl.formatMessage(messages.gpuMigColumnWorkload)}</Content>
              <Content component={ContentVariants.dd}>{workload}</Content>

              <Content component={ContentVariants.dt}>{intl.formatMessage(messages.gpuMigColumnGpuModel)}</Content>
              <Content component={ContentVariants.dd}>{gpuModel}</Content>

              <Content component={ContentVariants.dt}>{intl.formatMessage(messages.gpuTimeslicingColumnNode)}</Content>
              <Content component={ContentVariants.dd}>{nodeName}</Content>
            </Content>
          </Content>
        </div>
      </header>
    );
  };

  const getTermsTable = () => {
    if (items.length === 0) {
      return (
        <Alert isInline variant="info" title={intl.formatMessage(messages.optimizationsNoRecommendations)} />
      );
    }

    const gpu = containerDetail?.gpu;
    const showPeakHours = hasAnyGpuBhSizing(gpu);
    const peakHoursWarning = showPeakHours
      ? items
          .map(item => nestWarningMessage(gpuBhForTerm(gpu, item.term)?.notifications))
          .find(Boolean)
      : undefined;

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
        {peakHoursWarning ? (
          <Alert isInline variant="warning" title={peakHoursWarning} style={{ marginBottom: 12, marginTop: 16 }} />
        ) : null}
        <Title headingLevel="h3" size={TitleSizes.lg} style={{ marginBottom: 12, marginTop: 24 }}>
          {intl.formatMessage(messages.gpuMigProfileRecommendations)}
        </Title>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...headerCellStyle, textAlign: 'left' }}>
                {intl.formatMessage(messages.gpuMigColumnTerm)}
              </th>
              <th style={{ ...headerCellStyle, textAlign: 'left' }}>
                {intl.formatMessage(messages.gpuMigColumnCurrentProfile)}
              </th>
              <th style={{ ...headerCellStyle, textAlign: 'left' }}>
                {intl.formatMessage(messages.gpuMigColumnRecommendedProfile)}
              </th>
              <th style={{ ...headerCellStyle, textAlign: 'left' }}>
                {intl.formatMessage(messages.gpuMigColumnClassification)}
              </th>
              {showPeakHours ? (
                <>
                  <th style={{ ...headerCellStyle, textAlign: 'left' }}>
                    {intl.formatMessage(messages.gpuMigColumnPeakHoursProfile)}
                  </th>
                  <th style={{ ...headerCellStyle, textAlign: 'left' }}>
                    {intl.formatMessage(messages.gpuMigColumnPeakHoursClassification)}
                  </th>
                </>
              ) : null}
              <th style={{ ...headerCellStyle, textAlign: 'left' }}>
                {intl.formatMessage(messages.gpuMigColumnConfidence)}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const bh = gpuBhForTerm(gpu, item.term);
              const bhSizing = hasGpuBhSizing(bh);
              return (
                <tr key={idx}>
                  <td style={cellStyle}>{formatTerm(item.term)}</td>
                  <td style={cellStyle}>{item.current_gpu_profile ?? '—'}</td>
                  <td style={cellStyle}>
                    <strong>{item.recommended_gpu_profile ?? '—'}</strong>
                  </td>
                  <td style={cellStyle}>
                    {item.gpu_classification ? (
                      <Label color={classificationColorMap[item.gpu_classification] ?? 'grey'} isCompact>
                        {item.gpu_classification}
                      </Label>
                    ) : (
                      '—'
                    )}
                  </td>
                  {showPeakHours ? (
                    <>
                      <td style={cellStyle}>{bhSizing ? bh.recommended_gpu_profile : '—'}</td>
                      <td style={cellStyle}>
                        {bhSizing && bh.gpu_classification ? (
                          <Label color={classificationColorMap[bh.gpu_classification] ?? 'grey'} isCompact>
                            {bh.gpu_classification}
                          </Label>
                        ) : (
                          '—'
                        )}
                      </td>
                    </>
                  ) : null}
                  <td style={cellStyle}>
                    {item.confidence_level != null ? (
                      <Label
                        color={
                          item.confidence_level >= 0.7 ? 'green' : item.confidence_level >= 0.4 ? 'orange' : 'red'
                        }
                        isCompact
                      >
                        {String(item.confidence_level)}
                      </Label>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    );
  };

  const isLoading = reportFetchStatus === FetchStatus.inProgress;

  return (
    <>
      <PageSection style={styles.headerContainer}>
        {isLoading ? null : first ? getHeader() : null}
      </PageSection>
      <PageSection>
        {isLoading ? (
          <LoadingState
            body={intl.formatMessage(messages.optimizationsLoadingStateDesc)}
            heading={intl.formatMessage(messages.optimizationsLoadingStateTitle)}
          />
        ) : (
          <>
            {getTermsTable()}
            <GpuVisualInsightsSection
              dramActiveAvg={first?.dram_active_avg}
              fbUsageMaxMib={first?.fb_usage_max_mib}
              smActiveAvg={first?.sm_active_avg}
              tensorPipeActiveAvg={first?.tensor_pipe_active_avg}
              totalFbMib={first?.total_fb_mib}
            />
          </>
        )}
      </PageSection>
    </>
  );
};

const useMapToProps = ({ queryStateName }: GpuMigBreakdownMapProps): GpuMigBreakdownStateProps => {
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const location = useLocation();
  const listQueryState = location?.state?.[queryStateName] ?? {};

  const queryFromRoute = new URLSearchParams(location.search);
  const clusterUuid = queryFromRoute.get('cluster_uuid') ?? listQueryState.cluster_uuid ?? '';
  const namespace = queryFromRoute.get('namespace') ?? listQueryState.namespace ?? '';
  const container = queryFromRoute.get('container') ?? listQueryState.container ?? '';
  const gpuModel = queryFromRoute.get('gpu_model') ?? listQueryState.gpu_model ?? '';
  const workload = queryFromRoute.get('workload') ?? listQueryState.workload ?? '';

  const params = new URLSearchParams();
  if (clusterUuid) params.set('filter[cluster]', clusterUuid);
  if (namespace) params.set('filter[project]', namespace);
  if (container) params.set('filter[container]', container);
  if (gpuModel) params.set('filter[gpu_model]', gpuModel);
  params.set('limit', '50');
  const queryString = params.toString();

  const report = useSelector((state: RootState) =>
    rosSelectors.selectRos(state, RosPathsType.gpuMigRecommendations as any, RosType.ros as any, queryString)
  ) as GPUMIGRecommendationReport | undefined;
  const reportFetchStatus = useSelector((state: RootState) =>
    rosSelectors.selectRosFetchStatus(
      state,
      RosPathsType.gpuMigRecommendations as any,
      RosType.ros as any,
      queryString
    )
  );
  const reportError = useSelector((state: RootState) =>
    rosSelectors.selectRosError(
      state,
      RosPathsType.gpuMigRecommendations as any,
      RosType.ros as any,
      queryString
    )
  );

  const migContainerId = report?.data?.[0]?.id;
  const lookupQueryString =
    clusterUuid && container
      ? encodeContainerGpuLookupQuery({
          cluster_uuid: clusterUuid,
          project: namespace,
          workload: workload || undefined,
          container,
        })
      : '';
  const lookupReport = useSelector((state: RootState) =>
    lookupQueryString && !migContainerId
      ? (rosSelectors.selectRos(
          state,
          RosPathsType.recommendations as any,
          RosType.ros as any,
          lookupQueryString
        ) as { data?: Array<{ id?: string }> } | undefined)
      : undefined
  );
  const lookupFetchStatus = useSelector((state: RootState) =>
    lookupQueryString && !migContainerId
      ? rosSelectors.selectRosFetchStatus(
          state,
          RosPathsType.recommendations as any,
          RosType.ros as any,
          lookupQueryString
        )
      : FetchStatus.complete
  );
  const lookupError = useSelector((state: RootState) =>
    lookupQueryString && !migContainerId
      ? rosSelectors.selectRosError(
          state,
          RosPathsType.recommendations as any,
          RosType.ros as any,
          lookupQueryString
        )
      : undefined
  );

  const containerId = migContainerId || uniqueContainerId(lookupReport);
  const detailQueryString = containerId ? encodeRosDetailFetchQuery({ id: containerId }) : '';
  const containerDetail = useSelector((state: RootState) =>
    detailQueryString
      ? (rosSelectors.selectRos(
          state,
          RosPathsType.recommendation as any,
          RosType.ros as any,
          detailQueryString
        ) as RecommendationReportData | undefined)
      : undefined
  );
  const detailFetchStatus = useSelector((state: RootState) =>
    detailQueryString
      ? rosSelectors.selectRosFetchStatus(
          state,
          RosPathsType.recommendation as any,
          RosType.ros as any,
          detailQueryString
        )
      : FetchStatus.complete
  );
  const detailError = useSelector((state: RootState) =>
    detailQueryString
      ? rosSelectors.selectRosError(state, RosPathsType.recommendation as any, RosType.ros as any, detailQueryString)
      : undefined
  );

  useEffect(() => {
    if (clusterUuid && container && !reportError && reportFetchStatus !== FetchStatus.inProgress) {
      dispatch(
        rosActions.fetchRosReport(RosPathsType.gpuMigRecommendations as any, RosType.ros as any, queryString)
      );
    }
  }, [queryString]);

  useEffect(() => {
    if (
      !migContainerId &&
      lookupQueryString &&
      !lookupError &&
      lookupFetchStatus !== FetchStatus.inProgress
    ) {
      dispatch(
        rosActions.fetchRosReport(RosPathsType.recommendations as any, RosType.ros as any, lookupQueryString)
      );
    }
  }, [lookupQueryString, migContainerId]);

  useEffect(() => {
    if (detailQueryString && !detailError && detailFetchStatus !== FetchStatus.inProgress) {
      dispatch(
        rosActions.fetchRosReport(RosPathsType.recommendation as any, RosType.ros as any, detailQueryString)
      );
    }
  }, [detailQueryString]);

  const query = new URLSearchParams(location.search);

  return {
    breadcrumbLabel: query.get(breadcrumbLabelKey) ?? listQueryState.breadcrumbLabel,
    breadcrumbPath: listQueryState.breadcrumbPath,
    containerDetail,
    report,
    reportError,
    reportFetchStatus,
  };
};

export default GpuMigBreakdown;
