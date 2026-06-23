import { Content, ContentVariants, Title, TitleSizes } from '@patternfly/react-core';
import type { QuotaRecommendationDetailResponse } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { QuotaRecommendationTypeBadge, QuotaRiskLevelBadge } from 'routes/optimizations/optimizationsTable/quotaBadges';
import { formatMoneyCell, formatUtilizationPercent } from 'routes/optimizations/optimizationsTable/quotaTableUtils';
import { getTimeFromNow } from 'utils/dates';
import { getQuotaRecommendationId } from 'utils/recommendationIds';

import { RecommendationIdMetadata } from '../RecommendationIdMetadata';

import { styles } from '../optimizationsBreakdownHeader.styles';

interface QuotaBreakdownHeaderOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  detail?: QuotaRecommendationDetailResponse;
  linkState?: any;
}

const QuotaBreakdownHeader: React.FC<QuotaBreakdownHeaderOwnProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  detail,
  linkState,
}) => {
  const intl = useIntl();
  const savings = formatMoneyCell(detail?.estimated_savings);
  const title = detail?.quota_name ?? detail?.namespace ?? '';
  const recommendationId =
    detail?.id ??
    (detail?.cluster_uuid && detail?.namespace && detail?.quota_name
      ? getQuotaRecommendationId(detail.cluster_uuid, detail.namespace, detail.quota_name)
      : undefined);

  return (
    <header>
      <Link to={breadcrumbPath ?? '#'} state={{ ...linkState }}>
        {breadcrumbLabel ?? intl.formatMessage(messages.breakdownBackToOptimizations)}
      </Link>
      <div style={styles.title}>
        <Title headingLevel="h1" size={TitleSizes['2xl']}>
          {title}
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
              {intl.formatMessage(messages.optimizationsValues, { value: 'project' })}
            </Content>
            <Content component={ContentVariants.dd}>{detail?.namespace ?? '—'}</Content>

            <Content component={ContentVariants.dt}>
              {intl.formatMessage(messages.optimizationsValues, { value: 'cluster' })}
            </Content>
            <Content component={ContentVariants.dd}>{detail?.cluster_uuid ?? '—'}</Content>

            <Content component={ContentVariants.dt}>
              {intl.formatMessage(messages.quotaRiskLevel)}
            </Content>
            <Content component={ContentVariants.dd}>
              <QuotaRiskLevelBadge level={detail?.risk_level} />
            </Content>

            <Content component={ContentVariants.dt}>{intl.formatMessage(messages.quotaMaxUtilization)}</Content>
            <Content component={ContentVariants.dd}>{formatUtilizationPercent(detail?.utilization)}</Content>

            <Content component={ContentVariants.dt}>
              {intl.formatMessage(messages.savingsEstimatedMonthly)}
            </Content>
            <Content component={ContentVariants.dd}>{savings ?? '—'}</Content>

            <Content component={ContentVariants.dt}>
              {intl.formatMessage(messages.optimizationsValues, { value: 'last_reported' })}
            </Content>
            <Content component={ContentVariants.dd}>
              {detail?.last_observed_at ? getTimeFromNow(detail.last_observed_at) : '—'}
            </Content>
          </Content>
        </Content>
      </div>
    </header>
  );
};

export { QuotaBreakdownHeader };
