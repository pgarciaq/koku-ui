import { Card, CardBody, CardTitle, Title } from '@patternfly/react-core';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

import { PvcUtilizationGauge } from './pvcUtilizationGauge';

interface PvcVisualInsightsSectionOwnProps {
  capacityBytes: number;
  lastDate: string;
  nearFullThresholdBp?: number;
  usageBytesMax: number;
}

const PvcVisualInsightsSection: React.FC<PvcVisualInsightsSectionOwnProps> = ({
  capacityBytes,
  lastDate,
  nearFullThresholdBp,
  usageBytesMax,
}) => {
  const intl = useIntl();

  return (
    <Card>
      <CardTitle>
        <Title headingLevel="h2" size="lg">
          {intl.formatMessage(messages.visualInsights)}
        </Title>
      </CardTitle>
      <CardBody>
        <PvcUtilizationGauge
          capacityBytes={capacityBytes}
          lastDate={lastDate}
          nearFullThresholdBp={nearFullThresholdBp}
          usageBytesMax={usageBytesMax}
        />
      </CardBody>
    </Card>
  );
};

export { PvcVisualInsightsSection };
