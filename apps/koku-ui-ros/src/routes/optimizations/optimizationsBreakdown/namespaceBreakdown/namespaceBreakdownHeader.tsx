import { Content, ContentVariants, Title, TitleSizes } from '@patternfly/react-core';
import type { RecommendationReportData } from 'api/ros/recommendations';
import { NotificationWarningIcon } from 'components/notificationWarningIcon';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { getTimeFromNow } from 'utils/dates';
import { getNamespaceRecommendationId } from 'utils/recommendationIds';

import { styles } from '../optimizationsBreakdownHeader.styles';
import { RecommendationIdMetadata } from '../RecommendationIdMetadata';

interface NamespaceBreakdownHeaderOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  linkState?: any;
  report?: RecommendationReportData;
}

type NamespaceBreakdownHeaderProps = NamespaceBreakdownHeaderOwnProps;

const NamespaceBreakdownHeader: React.FC<NamespaceBreakdownHeaderProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  linkState,
  report,
}) => {
  const intl = useIntl();

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

    const savings = report?.recommendations?.estimated_monthly_savings;
    const savingsDisplay =
      savings?.value != null
        ? `$${Number(savings.value).toFixed(2)} ${savings.units ?? 'USD'}`
        : intl.formatMessage(messages.savingsNotAvailable);

    const monitoringEndTime = report?.recommendations?.monitoring_end_time;

    const recommendationId =
      report?.id ??
      (report?.cluster_uuid && report?.project
        ? getNamespaceRecommendationId(report.cluster_uuid, report.project)
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
          <Content component={ContentVariants.dt}>{intl.formatMessage(messages.savingsEstimatedMonthly)}</Content>
          <Content component={ContentVariants.dd}>
            {savingsDisplay}
            {(() => {
              const cpuSavings = report?.recommendations?.cpu_savings;
              const memorySavings = report?.recommendations?.memory_savings;
              if (cpuSavings?.value == null && memorySavings?.value == null) {
                return null;
              }
              const parts = [];
              if (cpuSavings?.value != null) {
                parts.push(`CPU: $${Number(cpuSavings.value).toFixed(2)}`);
              }
              if (memorySavings?.value != null) {
                parts.push(`Memory: $${Number(memorySavings.value).toFixed(2)}`);
              }
              return (
                <div
                  style={{
                    fontSize: 'var(--pf-t--global--font--size--xs)',
                    color: 'var(--pf-t--global--text--color--subtle)',
                  }}
                >
                  {parts.join(' | ')}
                </div>
              );
            })()}
          </Content>
          {monitoringEndTime && (
            <>
              <Content component={ContentVariants.dt}>{intl.formatMessage(messages.dataThrough)}</Content>
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
          {report ? report.project : null}
        </Title>
        <NotificationWarningIcon recommendations={report?.recommendations} style={styles.warningIcon} />
      </div>
      <div style={styles.description}>{getDescription()}</div>
    </header>
  );
};

export { NamespaceBreakdownHeader };
