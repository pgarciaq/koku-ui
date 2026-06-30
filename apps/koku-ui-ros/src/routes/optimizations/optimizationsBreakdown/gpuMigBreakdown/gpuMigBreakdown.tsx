import '../optimizationsBreakdown.scss';

import { Alert, Content, ContentVariants, Label, PageSection, Title, TitleSizes } from '@patternfly/react-core';
import type { GPUMIGRecommendationReport } from 'api/ros/recommendations';
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
  const { breadcrumbLabel, breadcrumbPath, report, reportFetchStatus } = useMapToProps({ queryStateName });
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
              <th style={{ ...headerCellStyle, textAlign: 'left' }}>
                {intl.formatMessage(messages.gpuMigColumnConfidence)}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
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
            <GpuVisualInsightsSection fbUsageMaxMib={first?.fb_usage_max_mib} totalFbMib={first?.total_fb_mib} />
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

  const clusterUuid = listQueryState.cluster_uuid ?? '';
  const namespace = listQueryState.namespace ?? '';
  const container = listQueryState.container ?? '';
  const gpuModel = listQueryState.gpu_model ?? '';

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

  useEffect(() => {
    if (clusterUuid && container && !reportError && reportFetchStatus !== FetchStatus.inProgress) {
      dispatch(
        rosActions.fetchRosReport(RosPathsType.gpuMigRecommendations as any, RosType.ros as any, queryString)
      );
    }
  }, [queryString]);

  const query = new URLSearchParams(location.search);

  return {
    breadcrumbLabel: query.get(breadcrumbLabelKey) ?? listQueryState.breadcrumbLabel,
    breadcrumbPath: listQueryState.breadcrumbPath,
    report,
    reportError,
    reportFetchStatus,
  };
};

export default GpuMigBreakdown;
