import { Card, CardBody, CardTitle, Grid, GridItem, Title } from '@patternfly/react-core';
import type { NodeDailyDigestItem } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

import { NodePodHeadroomGauge } from './nodePodHeadroomGauge';
import { NodeUtilizationTrend } from './visualInsights';

interface NodeVisualInsightsSectionOwnProps {
  dailyDigests?: NodeDailyDigestItem[];
  lastReported?: string;
  podCapacity: number;
  podCount: number;
  targetUtilizationBP?: number;
}

const NodeVisualInsightsSection: React.FC<NodeVisualInsightsSectionOwnProps> = ({
  dailyDigests,
  lastReported,
  podCapacity,
  podCount,
  targetUtilizationBP,
}) => {
  const intl = useIntl();

  const hasPodHeadroom = podCapacity > 0;
  const hasDigests = dailyDigests && dailyDigests.length > 0;

  if (!hasPodHeadroom && !hasDigests) {
    return null;
  }

  return (
    <Card>
      <CardTitle>
        <Title headingLevel="h2" size="lg">
          {intl.formatMessage(messages.visualInsights)}
        </Title>
      </CardTitle>
      <CardBody>
        {hasPodHeadroom && (
          <div style={{ marginBottom: hasDigests ? 24 : 0 }}>
            <NodePodHeadroomGauge lastReported={lastReported} podCapacity={podCapacity} podCount={podCount} />
          </div>
        )}
        {hasDigests && (
          <Grid hasGutter>
            <GridItem md={6}>
              <Title headingLevel="h3" size="md">
                {intl.formatMessage(messages.visualInsightsNodeCpuTrendTitle)}
              </Title>
              <NodeUtilizationTrend
                dailyDigests={dailyDigests}
                metricKey="cpu"
                targetUtilizationBP={targetUtilizationBP}
              />
            </GridItem>
            <GridItem md={6}>
              <Title headingLevel="h3" size="md">
                {intl.formatMessage(messages.visualInsightsNodeMemoryTrendTitle)}
              </Title>
              <NodeUtilizationTrend
                dailyDigests={dailyDigests}
                metricKey="memory"
                targetUtilizationBP={targetUtilizationBP}
              />
            </GridItem>
          </Grid>
        )}
      </CardBody>
    </Card>
  );
};

export { NodeVisualInsightsSection };
