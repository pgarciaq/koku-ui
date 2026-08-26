import '../optimizationsBreakdown.scss';

import { Alert, List, ListItem, PageSection } from '@patternfly/react-core';
import type { Query } from 'api/queries/query';
import { parseQuery } from 'api/queries/query';
import type { VmRecommendationData, VmSizingBlock } from 'api/ros/recommendations';
import { encodeVmDetailFetchQuery } from 'api/ros/recommendations';
import { RosPathsType, RosType } from 'api/ros/ros';
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
import { BreakdownDecayInfoCard } from '../shared/breakdownDecayInfoCard';
import { PeakHoursMetricTable, PeakHoursSizingCard } from '../shared/peakHoursSizing';
import { hasVmBhSizing, nestWarningMessage } from '../shared/peakHoursUtils';
import { useBreakdownProjection } from '../useBreakdownProjection';
import { VmVisualInsightsSection } from './visualInsights';
import { VmBreakdownHeader } from './vmBreakdownHeader';

interface VmBreakdownOwnProps {
  linkState?: any;
  projectPath?: string;
  queryStateName: string;
}

interface VmBreakdownMapProps {
  queryStateName: string;
}

interface VmBreakdownStateProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  clusterUuid?: string;
  namespace?: string;
  report?: VmRecommendationData;
  reportError?: AxiosError;
  reportFetchStatus?: FetchStatus;
  reportQueryString?: string;
  vmName?: string;
}

type VmBreakdownProps = VmBreakdownOwnProps & VmBreakdownStateProps;

const reportType = RosType.ros as any;
const reportPathsType = RosPathsType.vmRecommendation as any;

const VmBreakdown: React.FC<VmBreakdownProps> = ({ linkState, queryStateName }) => {
  const { breadcrumbLabel, breadcrumbPath, clusterUuid, namespace, report, reportFetchStatus, vmName } = useMapToProps({
    queryStateName,
  });
  const { term, engine } = useBreakdownProjection(queryStateName);
  const intl = useIntl();

  const getNotificationAlert = () => {
    const notifications = report?.notifications;
    if (!notifications || (Array.isArray(notifications) && notifications.length === 0)) {
      return null;
    }
    const items = Array.isArray(notifications) ? notifications : Object.values(notifications);
    return (
      <div style={styles.alertContainer}>
        <Alert isInline variant="warning" title={intl.formatMessage(messages.notificationsAlertTitle)}>
          <List>
            {items.map((n: any, index) => (
              <ListItem key={index}>{typeof n === 'string' ? n : n.message}</ListItem>
            ))}
          </List>
        </Alert>
      </div>
    );
  };

  const getBreakdownContent = () => {
    const current = report?.current;
    const recommended = report?.recommended;

    if (!recommended) {
      return (
        <div style={styles.alertContainer}>
          <Alert isInline variant="info" title={intl.formatMessage(messages.optimizationsNoRecommendations)} />
        </div>
      );
    }

    return (
      <div style={{ padding: '16px 0' }}>
        <VmSizingTable current={current} recommended={recommended} intl={intl} />
        <VmPeakHoursCard report={report} />
        <VmMetadataFlags report={report} intl={intl} />
        <div style={{ marginTop: 24 }}>
          <VmVisualInsightsSection
            clusterUuid={clusterUuid}
            current={current}
            dailyDigests={report?.daily_digests}
            estimatedMonthlySavings={report?.estimated_monthly_savings}
            namespace={namespace}
            recommended={recommended}
            vmName={vmName}
          />
        </div>
        <BreakdownDecayInfoCard recommendationType="vm" term={term} />
      </div>
    );
  };

  const isLoading = reportFetchStatus === FetchStatus.inProgress;

  return (
    <>
      <PageSection style={styles.headerContainer}>
        <VmBreakdownHeader
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
            {getBreakdownContent()}
          </div>
        )}
      </PageSection>
    </>
  );
};

const formatPeakHoursValue = (value: number | undefined, unit: string) => {
  if (value == null) {
    return '—';
  }
  return unit ? `${value.toFixed(2)} ${unit}` : value.toFixed(2);
};

const VmPeakHoursCard: React.FC<{ report?: VmRecommendationData }> = ({ report }) => {
  const bh = report?.business_hours;
  if (!hasVmBhSizing(bh)) {
    return null;
  }

  return (
    <div style={{ marginTop: 24 }}>
      <PeakHoursSizingCard warning={nestWarningMessage(bh.notifications)}>
        <PeakHoursMetricTable
          rows={[
            { metric: 'vCPU', value: formatPeakHoursValue(bh.recommended_vcpu, '') },
            { metric: 'Memory', value: formatPeakHoursValue(bh.recommended_memory_gib, 'GiB') },
          ]}
        />
      </PeakHoursSizingCard>
    </div>
  );
};

const VmSizingTable: React.FC<{
  current?: VmSizingBlock;
  recommended?: VmSizingBlock & { series?: string };
  intl: any;
}> = ({ current, recommended, intl }) => {
  const formatValue = (value: number | undefined, unit: string) => {
    if (value == null) return '—';
    return `${value.toFixed(2)} ${unit}`;
  };

  const hasCurrent = current != null;

  const cellStyle = {
    padding: '8px',
    borderBottom: '1px solid var(--pf-t--global--border--color--default)',
  };
  const headerStyle = {
    ...cellStyle,
    borderBottom: '2px solid var(--pf-t--global--border--color--default)',
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ ...headerStyle, textAlign: 'left' }}>{intl.formatMessage(messages.metric)}</th>
          {hasCurrent && (
            <th style={{ ...headerStyle, textAlign: 'right' }}>{intl.formatMessage(messages.current)}</th>
          )}
          <th style={{ ...headerStyle, textAlign: 'right' }}>{intl.formatMessage(messages.recommended)}</th>
          {hasCurrent && (
            <th style={{ ...headerStyle, textAlign: 'right' }}>{intl.formatMessage(messages.change)}</th>
          )}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={cellStyle}>vCPU</td>
          {hasCurrent && (
            <td style={{ ...cellStyle, textAlign: 'right' }}>{formatValue(current?.vcpu, '')}</td>
          )}
          <td style={{ ...cellStyle, textAlign: 'right' }}>{formatValue(recommended?.vcpu, '')}</td>
          {hasCurrent && (
            <td style={{ ...cellStyle, textAlign: 'right' }}>
              {current?.vcpu != null && recommended?.vcpu != null
                ? formatValue(recommended.vcpu - current.vcpu, '')
                : '—'}
            </td>
          )}
        </tr>
        <tr>
          <td style={cellStyle}>Memory</td>
          {hasCurrent && (
            <td style={{ ...cellStyle, textAlign: 'right' }}>{formatValue(current?.memory_gib, 'GiB')}</td>
          )}
          <td style={{ ...cellStyle, textAlign: 'right' }}>{formatValue(recommended?.memory_gib, 'GiB')}</td>
          {hasCurrent && (
            <td style={{ ...cellStyle, textAlign: 'right' }}>
              {current?.memory_gib != null && recommended?.memory_gib != null
                ? formatValue(recommended.memory_gib - current.memory_gib, 'GiB')
                : '—'}
            </td>
          )}
        </tr>
        {(current?.disk_gib != null || recommended?.disk_gib != null) && (
          <tr>
            <td style={cellStyle}>Disk</td>
            {hasCurrent && (
              <td style={{ ...cellStyle, textAlign: 'right' }}>{formatValue(current?.disk_gib, 'GiB')}</td>
            )}
            <td style={{ ...cellStyle, textAlign: 'right' }}>{formatValue(recommended?.disk_gib, 'GiB')}</td>
            {hasCurrent && (
              <td style={{ ...cellStyle, textAlign: 'right' }}>
                {current?.disk_gib != null && recommended?.disk_gib != null
                  ? formatValue(recommended.disk_gib - current.disk_gib, 'GiB')
                  : '—'}
              </td>
            )}
          </tr>
        )}
        {(current?.instance_type || recommended?.instance_type) && (
          <tr>
            <td style={cellStyle}>Instance type</td>
            {hasCurrent && <td style={{ ...cellStyle, textAlign: 'right' }}>{current?.instance_type ?? '—'}</td>}
            <td style={{ ...cellStyle, textAlign: 'right' }}>{recommended?.instance_type ?? '—'}</td>
            {hasCurrent && <td style={{ ...cellStyle, textAlign: 'right' }}>—</td>}
          </tr>
        )}
      </tbody>
    </table>
  );
};

const VmMetadataFlags: React.FC<{ report?: VmRecommendationData; intl: any }> = ({ report, intl }) => {
  const metadata = report?.metadata;
  if (!metadata) {
    return null;
  }

  const flags: string[] = [];
  if (metadata.is_idle) flags.push('Idle');
  if (metadata.is_abandoned) flags.push('Abandoned');
  if (metadata.is_power_off_candidate) flags.push('Power-off candidate');
  if (metadata.is_oversized) flags.push('Oversized');
  if (metadata.is_network_bound) flags.push('Network bound');
  if (metadata.is_redundant_placement) flags.push('Redundant placement');
  if (metadata.has_shared_storage) flags.push('Shared storage');
  if (metadata.numa_oversized) flags.push('NUMA oversized');

  if (flags.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: 16 }}>
      <Alert isInline variant="info" title={intl.formatMessage(messages.vmMetadataFlagsTitle)}>
        <List>
          {flags.map((flag, idx) => (
            <ListItem key={idx}>{flag}</ListItem>
          ))}
        </List>
      </Alert>
    </div>
  );
};

const useQueryFromRoute = () => {
  const location = useLocation();
  return parseQuery<Query>(location.search);
};

const useMapToProps = ({ queryStateName }: VmBreakdownMapProps): VmBreakdownStateProps => {
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const queryFromRoute = useQueryFromRoute();
  const location = useLocation();
  const listQueryState = location?.state?.[queryStateName] ?? {};

  const clusterUuid = (queryFromRoute as any)?.cluster_uuid ?? listQueryState.cluster_uuid;
  const namespace = (queryFromRoute as any)?.namespace ?? listQueryState.namespace;
  const vmName = queryFromRoute?.id ?? listQueryState.vm_name;

  const reportQueryString = encodeVmDetailFetchQuery({
    cluster_uuid: clusterUuid ?? '',
    namespace: namespace ?? '',
    vm_name: vmName ?? '',
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
    clusterUuid,
    namespace,
    report,
    reportError,
    reportFetchStatus,
    reportQueryString,
    vmName,
  };
};

export default VmBreakdown;
