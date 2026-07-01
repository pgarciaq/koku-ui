import { Card, CardBody, CardTitle, Spinner, Stack, StackItem, Title } from '@patternfly/react-core';
import type { HistoryRow } from 'api/ros/recommendationHistory';
import messages from 'locales/messages';
import React, { useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { FetchStatus } from 'store/common';

import { ContainerHistoryChart } from './containerHistoryChart';
import { CpuThrottleTrend } from './cpuThrottleTrend';
import { OomTimeline } from './oomTimeline';

interface VisualInsightsSectionProps {
  plotsData?: Record<string, any>;
  recommendationId: string;
  historyData?: HistoryRow[];
  historyFetchStatus?: FetchStatus;
}

const VisualInsightsSection: React.FC<VisualInsightsSectionProps> = ({
  plotsData,
  recommendationId,
  historyData,
  historyFetchStatus,
}) => {
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
              {intl.formatMessage(messages.historyChartTitle)}
            </Title>
            {historyFetchStatus === FetchStatus.inProgress ? (
              <Spinner size="lg" />
            ) : (
              <ContainerHistoryChart data={historyData ?? []} />
            )}
          </StackItem>
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
