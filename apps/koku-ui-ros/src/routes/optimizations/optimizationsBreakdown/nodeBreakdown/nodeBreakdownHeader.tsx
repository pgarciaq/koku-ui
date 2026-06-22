import { Content, ContentVariants, Label, Title, TitleSizes } from '@patternfly/react-core';
import type { NodeRecommendationData } from 'api/ros/recommendations';
import { ROS_LIST_ENGINE, ROS_LIST_TERM } from 'api/ros/rosListParams';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import type { OptimizationType } from 'utils/commonTypes';
import { formatPercentage } from 'utils/format';

import { styles } from '../optimizationsBreakdownHeader.styles';

interface NodeBreakdownHeaderOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  engine?: OptimizationType;
  linkState?: any;
  report?: NodeRecommendationData;
  term?: string;
}

type NodeBreakdownHeaderProps = NodeBreakdownHeaderOwnProps;

const NodeBreakdownHeader: React.FC<NodeBreakdownHeaderProps> = ({
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

  const getClassificationBadge = () => {
    const c = report?.classification;
    if (!c) return null;

    if (c.idle_state === 'idle' || c.idle_state === 'zombie') {
      return (
        <Label color={c.idle_state === 'zombie' ? 'red' : 'orange'} isCompact style={{ marginLeft: 8 }}>
          {c.idle_state === 'zombie' ? 'Zombie' : 'Idle'}
        </Label>
      );
    }
    if (c.is_underutilized) {
      return (
        <Label color="blue" isCompact style={{ marginLeft: 8 }}>
          {intl.formatMessage(messages.nodeClassificationUnderutilized)}
        </Label>
      );
    }
    if (c.is_overcommitted) {
      return (
        <Label color="orange" isCompact style={{ marginLeft: 8 }}>
          {intl.formatMessage(messages.nodeClassificationOvercommitted)}
        </Label>
      );
    }
    return null;
  };

  const getDescription = () => {
    const clusterUuid = report?.cluster_uuid ?? '';
    const instanceType = report?.instance_type;
    const suggestedInstanceType = report?.suggested_instance_type;
    const podCount = report?.pod_count;
    const podCapacity = report?.pod_capacity;
    const cpuP95 = report?.metrics?.cpu_util_p95;
    const memP95 = report?.metrics?.mem_util_p95;

    const selectedEngine = report?.recommendation_terms?.[term]?.recommendation_engines?.[engine];
    const savings = selectedEngine?.estimated_monthly_savings;
    const savingsDisplay =
      savings?.value != null
        ? `$${Number(savings.value).toFixed(2)} ${savings.units ?? 'USD'}`
        : intl.formatMessage(messages.savingsNotAvailable);

    return (
      <Content>
        <Content component={ContentVariants.dl}>
          <Content component={ContentVariants.dt}>
            {intl.formatMessage(messages.optimizationsValues, { value: 'cluster' })}
          </Content>
          <Content component={ContentVariants.dd}>{clusterUuid}</Content>

          {instanceType && (
            <>
              <Content component={ContentVariants.dt}>
                {intl.formatMessage(messages.optimizationsNames, { value: 'instance_type' })}
              </Content>
              <Content component={ContentVariants.dd}>
                {instanceType}
                {suggestedInstanceType && suggestedInstanceType !== instanceType && (
                  <span style={{ marginLeft: 8, color: 'var(--pf-t--global--text--color--subtle)' }}>
                    → {suggestedInstanceType}
                  </span>
                )}
              </Content>
            </>
          )}

          <Content component={ContentVariants.dt}>
            {intl.formatMessage(messages.optimizationsNames, { value: 'node_pod_count' })}
          </Content>
          <Content component={ContentVariants.dd}>
            {podCount ?? '—'}
            {podCapacity != null ? ` / ${podCapacity}` : ''}
          </Content>

          <Content component={ContentVariants.dt}>
            {intl.formatMessage(messages.optimizationsNames, { value: 'node_cpu_util' })}
          </Content>
          <Content component={ContentVariants.dd}>
            {cpuP95 != null ? formatPercentage(cpuP95 * 100) + '%' : '—'}
          </Content>

          <Content component={ContentVariants.dt}>
            {intl.formatMessage(messages.optimizationsNames, { value: 'node_mem_util' })}
          </Content>
          <Content component={ContentVariants.dd}>
            {memP95 != null ? formatPercentage(memP95 * 100) + '%' : '—'}
          </Content>

          <Content component={ContentVariants.dt}>{intl.formatMessage(messages.savingsEstimatedMonthly)}</Content>
          <Content component={ContentVariants.dd}>{savingsDisplay}</Content>
        </Content>
      </Content>
    );
  };

  return (
    <header>
      {getBackToLink()}
      <div style={styles.title}>
        <Title headingLevel="h1" size={TitleSizes['2xl']}>
          {report?.node ?? ''}
        </Title>
        {getClassificationBadge()}
      </div>
      <div style={styles.description}>{getDescription()}</div>
    </header>
  );
};

export { NodeBreakdownHeader };
