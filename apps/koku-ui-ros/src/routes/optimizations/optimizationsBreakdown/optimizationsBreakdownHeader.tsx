import { Content, ContentVariants, Icon, Label, Title, TitleSizes, Tooltip } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import type { RecommendationReportData } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { getTimeFromNow } from 'utils/dates';
import { getContainerRecommendationId } from 'utils/recommendationIds';
import { hasNotificationsWarning } from 'utils/notifications';

import { RecommendationIdMetadata } from './RecommendationIdMetadata';

import { styles } from './optimizationsBreakdownHeader.styles';
import { OptimizationsBreakdownProjectLink } from './optimizationsBreakdownProjectLink';

interface OptimizationsBreakdownHeaderOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  linkState?: any;
  projectPath?: string;
  report?: RecommendationReportData;
}

type OptimizationsBreakdownHeaderProps = OptimizationsBreakdownHeaderOwnProps;

const OptimizationsBreakdownHeader: React.FC<OptimizationsBreakdownHeaderProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  linkState,
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

    const recommendationId =
      report?.id ??
      (report?.cluster_uuid && report?.project && report?.workload && report?.workload_type && report?.container
        ? getContainerRecommendationId(
            report.cluster_uuid,
            report.project,
            report.workload,
            report.workload_type,
            report.container
          )
        : undefined);

    return (
      <Content>
        <Content component={ContentVariants.dl} style={styles.metadataList}>
          <RecommendationIdMetadata recommendationId={recommendationId} />
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
          <Content component={ContentVariants.dd}>
            {savingsDisplay}
            {(() => {
              const cpuSavings = report?.recommendations?.cpu_savings;
              const memorySavings = report?.recommendations?.memory_savings;
              if (cpuSavings?.value == null && memorySavings?.value == null) return null;
              const parts = [];
              if (cpuSavings?.value != null) parts.push(`CPU: $${Number(cpuSavings.value).toFixed(2)}`);
              if (memorySavings?.value != null) parts.push(`Memory: $${Number(memorySavings.value).toFixed(2)}`);
              return <div style={{ fontSize: 'var(--pf-t--global--font--size--xs)', color: 'var(--pf-t--global--text--color--subtle)' }}>{parts.join(' | ')}</div>;
            })()}
          </Content>
          {replicas && (
            <>
              <Content component={ContentVariants.dt}>
                {intl.formatMessage(messages.replicaCount)}
              </Content>
              <Content component={ContentVariants.dd}>
                {intl.formatMessage(messages.replicaValues, {
                  available: replicaValue(replicas.available),
                  min: replicaValue(replicas.min),
                  max: replicaValue(replicas.max),
                  desired: replicaValue(replicas.desired),
                })}
              </Content>
            </>
          )}
          {(() => {
            const replicaOpt = report?.recommendations?.replica_optimization;
            if (!replicaOpt?.recommended_replicas) return null;
            const current = replicas?.desired ?? replicas?.available;
            const recommended = replicaOpt.recommended_replicas;
            const diff = current != null ? current - recommended : 0;

            let badge: React.ReactNode;
            if (diff > 0) {
              badge = <Label color="green">{intl.formatMessage(messages.replicaOptimizationReduceBy, { count: diff })}</Label>;
            } else if (diff < 0) {
              badge = <Label color="orange">{intl.formatMessage(messages.replicaOptimizationScaleUp, { count: Math.abs(diff) })}</Label>;
            } else {
              badge = <Label color="blue" icon={<CheckCircleIcon />}>{intl.formatMessage(messages.replicaOptimizationOptimal)}</Label>;
            }

            const confidenceMsg = replicaOpt.confidence === 'high'
              ? messages.replicaOptimizationConfidenceHigh
              : replicaOpt.confidence === 'medium'
                ? messages.replicaOptimizationConfidenceMedium
                : messages.replicaOptimizationConfidenceLow;

            return (
              <>
                <Content component={ContentVariants.dt}>
                  {intl.formatMessage(messages.replicaOptimizationTitle)}
                </Content>
                <Content component={ContentVariants.dd}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {intl.formatMessage(messages.replicaOptimizationRecommended, { recommended })}
                    {badge}
                    <Tooltip content={replicaOpt.explanation || intl.formatMessage(confidenceMsg)}>
                      <Label variant="outline" color={replicaOpt.confidence === 'high' ? 'green' : replicaOpt.confidence === 'medium' ? 'yellow' : 'orange'}>
                        {intl.formatMessage(confidenceMsg)}
                      </Label>
                    </Tooltip>
                  </span>
                </Content>
              </>
            );
          })()}
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
    </header>
  );
};

export { OptimizationsBreakdownHeader };
