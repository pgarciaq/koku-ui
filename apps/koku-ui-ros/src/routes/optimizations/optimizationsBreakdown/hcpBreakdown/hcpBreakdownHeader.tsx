import { Content, ContentVariants, Icon, Label, Title, TitleSizes } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import type { RecommendationReportData } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { getTimeFromNow } from 'utils/dates';
import { hasNotificationsWarning } from 'utils/notifications';

import { styles } from '../optimizationsBreakdownHeader.styles';
import { RecommendationIdMetadata } from '../RecommendationIdMetadata';

interface HcpBreakdownHeaderOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  linkState?: any;
  report?: RecommendationReportData;
}

type HcpBreakdownHeaderProps = HcpBreakdownHeaderOwnProps;

const HcpBreakdownHeader: React.FC<HcpBreakdownHeaderProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  linkState,
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

    const savings = report?.recommendations?.estimated_monthly_savings;
    const savingsDisplay =
      savings?.value != null
        ? `$${Number(savings.value).toFixed(2)} ${savings.units ?? 'USD'}`
        : intl.formatMessage(messages.savingsNotAvailable);

    return (
      <Content>
        <Content component={ContentVariants.dl} style={styles.metadataList}>
          <RecommendationIdMetadata recommendationId={report?.id} />
          <Content component={ContentVariants.dt}>
            {intl.formatMessage(messages.optimizationsValues, { value: 'last_reported' })}
          </Content>
          <Content component={ContentVariants.dd}>{lastReported}</Content>
          <Content component={ContentVariants.dt}>
            {intl.formatMessage(messages.optimizationsValues, { value: 'cluster' })}
          </Content>
          <Content component={ContentVariants.dd}>{cluster}</Content>
          <Content component={ContentVariants.dt}>
            {intl.formatMessage(messages.optimizationsNames, { value: 'hosted_cluster' })}
          </Content>
          <Content component={ContentVariants.dd}>
            {report?.hosted_cluster_id ? (
              report.hosted_cluster_id
            ) : (
              <Label color="grey">{intl.formatMessage(messages.hcpIncomplete)}</Label>
            )}
          </Content>
          <Content component={ContentVariants.dt}>{intl.formatMessage(messages.savingsEstimatedMonthly)}</Content>
          <Content component={ContentVariants.dd}>{savingsDisplay}</Content>
        </Content>
      </Content>
    );
  };

  const title = report?.container ?? report?.project ?? '';

  return (
    <header>
      {getBackToLink()}
      <div style={styles.title}>
        <Title headingLevel="h1" size={TitleSizes['2xl']}>
          {title}
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

export { HcpBreakdownHeader };
