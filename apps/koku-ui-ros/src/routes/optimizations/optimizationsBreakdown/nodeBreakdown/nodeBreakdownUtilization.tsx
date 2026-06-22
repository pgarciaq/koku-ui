import { Card, CardBody, CardTitle, Grid, GridItem, Progress, ProgressSize } from '@patternfly/react-core';
import type { NodeMetrics } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

import { formatUtilPercentRange } from '../../optimizationsTable/nodeTableUtils';

interface NodeBreakdownUtilizationOwnProps {
  metrics?: NodeMetrics;
}

type NodeBreakdownUtilizationProps = NodeBreakdownUtilizationOwnProps;

const toProgressValue = (fraction?: number): number => {
  if (fraction == null) {
    return 0;
  }
  return Math.min(100, Math.max(0, fraction * 100));
};

const NodeBreakdownUtilization: React.FC<NodeBreakdownUtilizationProps> = ({ metrics }) => {
  const intl = useIntl();

  if (!metrics) {
    return null;
  }

  const cpuRange = formatUtilPercentRange(metrics.cpu_util_p50, metrics.cpu_util_p95);
  const memRange = formatUtilPercentRange(metrics.mem_util_p50, metrics.mem_util_p95);

  return (
    <Card>
      <CardTitle>{intl.formatMessage(messages.nodeUtilizationTitle)}</CardTitle>
      <CardBody>
        <Grid hasGutter>
          <GridItem md={6}>
            <div style={{ marginBottom: 8 }}>
              {intl.formatMessage(messages.optimizationsNames, { value: 'node_cpu_util' })}
            </div>
            <div style={{ marginBottom: 4, fontSize: 'var(--pf-t--global--font--size--sm)' }}>{cpuRange}</div>
            <Progress
              aria-label={intl.formatMessage(messages.nodeUtilizationP50Label, { resource: 'CPU' })}
              size={ProgressSize.sm}
              title={intl.formatMessage(messages.nodeUtilizationP50Label, { resource: 'CPU' })}
              value={toProgressValue(metrics.cpu_util_p50)}
            />
            <Progress
              aria-label={intl.formatMessage(messages.nodeUtilizationP95Label, { resource: 'CPU' })}
              size={ProgressSize.sm}
              title={intl.formatMessage(messages.nodeUtilizationP95Label, { resource: 'CPU' })}
              value={toProgressValue(metrics.cpu_util_p95)}
            />
          </GridItem>
          <GridItem md={6}>
            <div style={{ marginBottom: 8 }}>
              {intl.formatMessage(messages.optimizationsNames, { value: 'node_mem_util' })}
            </div>
            <div style={{ marginBottom: 4, fontSize: 'var(--pf-t--global--font--size--sm)' }}>{memRange}</div>
            <Progress
              aria-label={intl.formatMessage(messages.nodeUtilizationP50Label, { resource: 'Memory' })}
              size={ProgressSize.sm}
              title={intl.formatMessage(messages.nodeUtilizationP50Label, { resource: 'Memory' })}
              value={toProgressValue(metrics.mem_util_p50)}
            />
            <Progress
              aria-label={intl.formatMessage(messages.nodeUtilizationP95Label, { resource: 'Memory' })}
              size={ProgressSize.sm}
              title={intl.formatMessage(messages.nodeUtilizationP95Label, { resource: 'Memory' })}
              value={toProgressValue(metrics.mem_util_p95)}
            />
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  );
};

export { NodeBreakdownUtilization };
