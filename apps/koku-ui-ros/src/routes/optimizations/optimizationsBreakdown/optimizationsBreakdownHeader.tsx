import { Content, ContentVariants, Icon, Title, TitleSizes, Tooltip } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import type { RecommendationReportData } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import type { OptimizationType } from 'utils/commonTypes';
import { getTimeFromNow } from 'utils/dates';
import { hasNotificationsWarning } from 'utils/notifications';

import { styles } from './optimizationsBreakdownHeader.styles';
import { OptimizationsBreakdownProjectLink } from './optimizationsBreakdownProjectLink';
import { OptimizationsBreakdownToolbar } from './optimizationsBreakdownToolbar';

interface OptimizationsBreakdownHeaderOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  currentInterval?: string;
  isDisabled?: boolean;
  linkState?: any;
  onSelect?: (value: string) => void;
  optimizationType?: OptimizationType;
  projectPath?: string;
  report?: RecommendationReportData;
}

type OptimizationsBreakdownHeaderProps = OptimizationsBreakdownHeaderOwnProps;

const OptimizationsBreakdownHeader: React.FC<OptimizationsBreakdownHeaderProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  currentInterval,
  isDisabled,
  linkState,
  onSelect,
  optimizationType,
  projectPath,
  report,
}) => {
  const intl = useIntl();
  const showWarningIcon = hasNotificationsWarning(report?.recommendations);

  const getBackToLink = () => {
    return (
      <Link to={breadcrumbPath} state={{ ...linkState }}>
        {breadcrumbLabel ? breadcrumbLabel : intl.formatMessage(messages.breakdownBackToOptimizations)}
      </Link>
    );
  };

  const getDescription = () => {
    const clusterAlias = report?.cluster_alias ? report.cluster_alias : undefined;
    const clusterUuid = report?.cluster_uuid ? report.cluster_uuid : '';
    const cluster = clusterAlias ? clusterAlias : clusterUuid;

    const lastReported = report ? getTimeFromNow(report.last_reported) : '';
    const project = report?.project ? report.project : undefined;
    const workload = report?.workload ? report.workload : undefined;
    const workloadType = report?.workload_type ? report.workload_type : '';

    const savings = report?.recommendations?.estimated_monthly_savings;
    const savingsDisplay = savings?.value != null
      ? `$${Number(savings.value).toFixed(2)} ${savings.units ?? 'USD'}`
      : intl.formatMessage(messages.savingsNotAvailable);

    const replicas = report?.recommendations?.replicas;
    const monitoringEndTime = report?.recommendations?.monitoring_end_time;

    const replicaValue = (val: number | null | undefined) => {
      if (val != null) {
        return val;
      }
      return (
        <Tooltip content={intl.formatMessage(messages.replicaNoDataTooltip)}>
          <span tabIndex={0} style={{ cursor: 'default', borderBottom: '1px dotted' }}>—</span>
        </Tooltip>
      );
    };

    return (
      <Content>
        <Content component={ContentVariants.dl}>
          <Content component={ContentVariants.dt}>
            {intl.formatMessage(messages.optimizationsValues, { value: 'last_reported' })}
          </Content>
          <Content component={ContentVariants.dd}>{lastReported}</Content>
          <Content component={ContentVariants.dt}>
            {intl.formatMessage(messages.optimizationsValues, { value: 'cluster' })}
          </Content>
          <Content component={ContentVariants.dd}>{cluster}</Content>
          <Content component={ContentVariants.dt}>
            {intl.formatMessage(messages.optimizationsValues, { value: 'project' })}
          </Content>
          <Content component={ContentVariants.dd}>
            <OptimizationsBreakdownProjectLink
              breadcrumbLabel={intl.formatMessage(messages.breakdownBackToOptimizationsProject, { value: project })}
              linkState={linkState}
              project={project}
              projectPath={projectPath}
            />
          </Content>
          <Content component={ContentVariants.dt}>
            {intl.formatMessage(messages.optimizationsValues, { value: 'workload_type' })}
          </Content>
          <Content component={ContentVariants.dd}>{workloadType}</Content>
          <Content component={ContentVariants.dt}>
            {intl.formatMessage(messages.optimizationsValues, { value: 'workload' })}
          </Content>
          <Content component={ContentVariants.dd}>{workload}</Content>
          <Content component={ContentVariants.dt}>
            {intl.formatMessage(messages.savingsEstimatedMonthly)}
          </Content>
          <Content component={ContentVariants.dd}>{savingsDisplay}</Content>
          {replicas && (
            <>
              <Content component={ContentVariants.dt}>
                {intl.formatMessage(messages.replicaCount)}
              </Content>
              <Content component={ContentVariants.dd}>
                {intl.formatMessage(messages.replicaValues, {
                  min: replicaValue(replicas.min),
                  max: replicaValue(replicas.max),
                  desired: replicaValue(replicas.desired),
                })}
              </Content>
            </>
          )}
          {monitoringEndTime && (
            <>
              <Content component={ContentVariants.dt}>
                {intl.formatMessage(messages.dataThrough)}
              </Content>
              <Content component={ContentVariants.dd}>
                {intl.formatDate(new Date(monitoringEndTime), { year: 'numeric', month: 'short', day: 'numeric' })}
              </Content>
            </>
          )}
        </Content>
      </Content>
    );
  };

  return (
    <header>
      {getBackToLink()}
      <div style={styles.title}>
        <Title headingLevel="h1" size={TitleSizes['2xl']}>
          {report ? report.container : null}
        </Title>
        {showWarningIcon && (
          <span style={styles.warningIcon}>
            <Icon status="warning">
              <ExclamationTriangleIcon />
            </Icon>
          </span>
        )}
      </div>
      <div style={styles.description}>{getDescription()}</div>
      <div style={styles.toolbar}>
        <OptimizationsBreakdownToolbar
          currentInterval={currentInterval}
          isDisabled={isDisabled}
          onSelect={onSelect}
          optimizationType={optimizationType}
          recommendations={report?.recommendations}
        />
      </div>
    </header>
  );
};

export { OptimizationsBreakdownHeader };
