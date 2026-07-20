import { Content, ContentVariants, Label, Title, TitleSizes } from '@patternfly/react-core';
import type { VmRecommendationData } from 'api/ros/recommendations';
import { ROS_LIST_ENGINE, ROS_LIST_TERM } from 'api/ros/rosListParams';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import type { OptimizationType } from 'utils/commonTypes';
import { getTimeFromNow } from 'utils/dates';

import { RecommendationIdMetadata } from '../RecommendationIdMetadata';
import { styles } from '../optimizationsBreakdownHeader.styles';

interface VmBreakdownHeaderOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  engine?: OptimizationType;
  linkState?: any;
  report?: VmRecommendationData;
  term?: string;
}

type VmBreakdownHeaderProps = VmBreakdownHeaderOwnProps;

const VmBreakdownHeader: React.FC<VmBreakdownHeaderProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  engine = ROS_LIST_ENGINE,
  linkState,
  report,
  term = ROS_LIST_TERM,
}) => {
  const intl = useIntl();

  const getBackToLink = () => {
    return (
      <Link to={breadcrumbPath} state={{ ...linkState }}>
        {breadcrumbLabel ? breadcrumbLabel : intl.formatMessage(messages.breakdownBackToOptimizations)}
      </Link>
    );
  };

  const getStatusBadge = () => {
    const metadata = report?.metadata;
    if (!metadata) return null;

    if (metadata.is_idle) {
      return (
        <Label color="orange" isCompact style={{ marginLeft: 8 }}>
          {intl.formatMessage(messages.vmStatusIdle)}
        </Label>
      );
    }
    if (metadata.is_abandoned) {
      return (
        <Label color="red" isCompact style={{ marginLeft: 8 }}>
          {intl.formatMessage(messages.vmStatusAbandoned)}
        </Label>
      );
    }
    if (metadata.is_oversized) {
      return (
        <Label color="blue" isCompact style={{ marginLeft: 8 }}>
          {intl.formatMessage(messages.vmStatusOversized)}
        </Label>
      );
    }
    if (metadata.is_power_off_candidate) {
      return (
        <Label color="orange" isCompact style={{ marginLeft: 8 }}>
          {intl.formatMessage(messages.vmStatusPowerOff)}
        </Label>
      );
    }
    return null;
  };

  const getDescription = () => {
    const clusterUuid = report?.cluster_uuid ?? '';
    const namespace = report?.namespace ?? '—';
    const guestOs = report?.guest_os;
    const currentInstanceType = report?.current?.instance_type;
    const recommendedInstanceType = report?.recommended?.instance_type;
    const recommendedSeries = report?.recommended?.series;

    const savings = report?.estimated_monthly_savings;
    const savingsDisplay =
      savings?.value != null
        ? `$${Number(savings.value).toFixed(2)} ${savings.units ?? 'USD'}`
        : intl.formatMessage(messages.savingsNotAvailable);

    const lastReported = report?.last_recommended_at ? getTimeFromNow(report.last_recommended_at) : '—';

    const confidence = report?.metadata?.confidence;
    const preferenceName = report?.metadata?.preference_name;

    return (
      <Content>
        <Content component={ContentVariants.dl} style={styles.metadataList}>
          <RecommendationIdMetadata recommendationId={report?.id} />

          <Content component={ContentVariants.dt}>
            {intl.formatMessage(messages.optimizationsValues, { value: 'cluster' })}
          </Content>
          <Content component={ContentVariants.dd}>{clusterUuid}</Content>

          <Content component={ContentVariants.dt}>
            {intl.formatMessage(messages.optimizationsNames, { value: 'namespace' })}
          </Content>
          <Content component={ContentVariants.dd}>{namespace}</Content>

          {guestOs && (
            <>
              <Content component={ContentVariants.dt}>
                {intl.formatMessage(messages.optimizationsNames, { value: 'vm_guest_os' })}
              </Content>
              <Content component={ContentVariants.dd}>{guestOs}</Content>
            </>
          )}

          {currentInstanceType && (
            <>
              <Content component={ContentVariants.dt}>
                {intl.formatMessage(messages.optimizationsNames, { value: 'instance_type' })}
              </Content>
              <Content component={ContentVariants.dd}>
                {currentInstanceType}
                {recommendedInstanceType && recommendedInstanceType !== currentInstanceType && (
                  <span style={{ marginLeft: 8, color: 'var(--pf-t--global--text--color--subtle)' }}>
                    → {recommendedInstanceType}
                  </span>
                )}
              </Content>
            </>
          )}

          {recommendedSeries && (
            <>
              <Content component={ContentVariants.dt}>
                {intl.formatMessage(messages.optimizationsNames, { value: 'vm_recommended_series' })}
              </Content>
              <Content component={ContentVariants.dd}>{recommendedSeries}</Content>
            </>
          )}

          {confidence && (
            <>
              <Content component={ContentVariants.dt}>
                {intl.formatMessage(messages.optimizationsNames, { value: 'vm_confidence' })}
              </Content>
              <Content component={ContentVariants.dd}>{confidence}</Content>
            </>
          )}

          {preferenceName && (
            <>
              <Content component={ContentVariants.dt}>
                {intl.formatMessage(messages.optimizationsNames, { value: 'vm_preference' })}
              </Content>
              <Content component={ContentVariants.dd}>{preferenceName}</Content>
            </>
          )}

          <Content component={ContentVariants.dt}>{intl.formatMessage(messages.savingsEstimatedMonthly)}</Content>
          <Content component={ContentVariants.dd}>{savingsDisplay}</Content>

          <Content component={ContentVariants.dt}>
            {intl.formatMessage(messages.optimizationsValues, { value: 'last_reported' })}
          </Content>
          <Content component={ContentVariants.dd}>{lastReported}</Content>
        </Content>
      </Content>
    );
  };

  return (
    <header>
      {getBackToLink()}
      <div style={styles.title}>
        <Title headingLevel="h1" size={TitleSizes['2xl']}>
          {report?.vm_name ?? ''}
        </Title>
        {getStatusBadge()}
      </div>
      <div style={styles.description}>{getDescription()}</div>
    </header>
  );
};

export { VmBreakdownHeader };
