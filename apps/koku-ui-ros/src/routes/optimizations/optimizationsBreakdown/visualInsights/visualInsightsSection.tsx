import { Card, CardBody, CardTitle, Stack, StackItem, Title } from '@patternfly/react-core';
import messages from 'locales/messages';
import React, { useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { CpuThrottleTrend } from './cpuThrottleTrend';
import { OomTimeline } from './oomTimeline';

interface VisualInsightsSectionProps {
  plotsData?: Record<string, any>;
  recommendationId: string;
}

const VisualInsightsSection: React.FC<VisualInsightsSectionProps> = ({ plotsData, recommendationId }) => {
  const intl = useIntl();
  const [hasOomData, setHasOomData] = useState<boolean | undefined>(undefined);

  const onOomDataResolved = useCallback((hasData: boolean) => {
    setHasOomData(hasData);
  }, []);

  const hasThrottleData = useMemo(() => {
    if (!plotsData) {
      return false;
    }
    return Object.values(plotsData).some(
      (bucket: any) => bucket?.cpuThrottle && (bucket.cpuThrottle.p95 > 0 || bucket.cpuThrottle.max > 0)
    );
  }, [plotsData]);

  // Hide the entire section when both features report no data (e.g. toggle disabled backend-side).
  // Wait until OOM data fetch completes (hasOomData !== undefined) before deciding.
  if (hasOomData === false && !hasThrottleData) {
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
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h3" size="md">
              {intl.formatMessage(messages.visualInsightsOomTimeline)}
            </Title>
            <OomTimeline recommendationId={recommendationId} onDataResolved={onOomDataResolved} />
          </StackItem>
          <StackItem>
            <Title headingLevel="h3" size="md">
              {intl.formatMessage(messages.visualInsightsCpuThrottleTrend)}
            </Title>
            <CpuThrottleTrend plotsData={plotsData} />
          </StackItem>
        </Stack>
      </CardBody>
    </Card>
  );
};

export { VisualInsightsSection };
