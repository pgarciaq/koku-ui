import { Card, CardBody, CardTitle, Title } from '@patternfly/react-core';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

import { NodePodHeadroomGauge } from './nodePodHeadroomGauge';

interface NodeVisualInsightsSectionOwnProps {
  lastReported?: string;
  podCapacity: number;
  podCount: number;
}

const NodeVisualInsightsSection: React.FC<NodeVisualInsightsSectionOwnProps> = ({
  lastReported,
  podCapacity,
  podCount,
}) => {
  const intl = useIntl();

  if (!podCapacity || podCapacity <= 0) {
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
        <NodePodHeadroomGauge lastReported={lastReported} podCapacity={podCapacity} podCount={podCount} />
      </CardBody>
    </Card>
  );
};

export { NodeVisualInsightsSection };
