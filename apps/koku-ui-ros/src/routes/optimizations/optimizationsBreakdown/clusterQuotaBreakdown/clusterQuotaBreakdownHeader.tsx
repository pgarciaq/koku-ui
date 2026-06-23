import { Content, ContentVariants, Title, TitleSizes } from '@patternfly/react-core';
import type { ClusterQuotaRecommendationDetailResponse } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { QuotaRecommendationTypeBadge, QuotaRiskLevelBadge } from 'routes/optimizations/optimizationsTable/quotaBadges';
import { formatMoneyCell, formatUtilizationPercent } from 'routes/optimizations/optimizationsTable/quotaTableUtils';
import { getClusterQuotaRecommendationId } from 'utils/recommendationIds';

import { RecommendationIdMetadata } from '../RecommendationIdMetadata';

import { styles } from '../optimizationsBreakdownHeader.styles';

interface ClusterQuotaBreakdownHeaderOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  detail?: ClusterQuotaRecommendationDetailResponse;
  linkState?: any;
}

const ClusterQuotaBreakdownHeader: React.FC<ClusterQuotaBreakdownHeaderOwnProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  detail,
  linkState,
}) => {
  const intl = useIntl();
  const savings = formatMoneyCell(detail?.estimated_savings);
  const namespaceSummary =
    detail?.namespaces && detail.namespaces.length > 0
      ? detail.namespaces.length <= 5
        ? detail.namespaces.join(', ')
        : intl.formatMessage(messages.quotaNamespaceCount, { count: detail.namespaces.length })
      : '—';
  const recommendationId =
    detail?.id ??
    (detail?.cluster_uuid && detail?.cluster_quota_name
      ? getClusterQuotaRecommendationId(detail.cluster_uuid, detail.cluster_quota_name)
      : undefined);

  return (
    <header>
      <Link to={breadcrumbPath ?? '#'} state={{ ...linkState }}>
        {breadcrumbLabel ?? intl.formatMessage(messages.breakdownBackToOptimizations)}
      </Link>
      <div style={styles.title}>
        <Title headingLevel="h1" size={TitleSizes['2xl']}>
          {detail?.cluster_quota_name ?? ''}
        </Title>
        <span style={{ marginLeft: 8 }}>
          <QuotaRecommendationTypeBadge type={detail?.recommendation_type} />
        </span>
      </div>
      <div style={styles.description}>
        <Content>
          <Content component={ContentVariants.dl}>
            <RecommendationIdMetadata recommendationId={recommendationId} />
            <Content component={ContentVariants.dt}>
              {intl.formatMessage(messages.optimizationsValues, { value: 'cluster' })}
            </Content>
            <Content component={ContentVariants.dd}>{detail?.cluster_uuid ?? '—'}</Content>

            <Content component={ContentVariants.dt}>{intl.formatMessage(messages.quotaNamespaces)}</Content>
            <Content component={ContentVariants.dd}>{namespaceSummary}</Content>

            <Content component={ContentVariants.dt}>{intl.formatMessage(messages.quotaRiskLevel)}</Content>
            <Content component={ContentVariants.dd}>
              <QuotaRiskLevelBadge level={detail?.risk_level} />
            </Content>

            <Content component={ContentVariants.dt}>{intl.formatMessage(messages.quotaMaxUtilization)}</Content>
            <Content component={ContentVariants.dd}>{formatUtilizationPercent(detail?.utilization)}</Content>

            <Content component={ContentVariants.dt}>
              {intl.formatMessage(messages.savingsEstimatedMonthly)}
            </Content>
            <Content component={ContentVariants.dd}>{savings ?? '—'}</Content>
          </Content>
        </Content>
      </div>
    </header>
  );
};

export { ClusterQuotaBreakdownHeader };
