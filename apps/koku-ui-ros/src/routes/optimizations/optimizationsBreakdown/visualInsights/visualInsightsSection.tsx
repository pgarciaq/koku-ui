import { Card, CardBody, CardTitle, Stack, StackItem, Title } from '@patternfly/react-core';
import type { HistoryRow } from 'api/ros/recommendationHistory';
import type { OomTimelineEntry } from 'api/ros/recommendations';
import { fetchOomTimeline } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useMemo, useState } from 'react';
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
  // The section owns the OOM fetch (#696): visibility is decided from data
  // known here, so nothing renders (and nothing unmounts later) while the
  // fetch is in flight.
  const [oomEntries, setOomEntries] = useState<OomTimelineEntry[] | undefined>(undefined);
  const [oomHasError, setOomHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setOomEntries(undefined);
    setOomHasError(false);
    fetchOomTimeline(recommendationId)
      .then(response => {
        if (!cancelled) {
          setOomEntries(response?.data?.data ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOomEntries([]);
          setOomHasError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [recommendationId]);

  const hasThrottleData = useMemo(() => {
    if (!plotsData) {
      return false;
    }
    return Object.values(plotsData).some(
      (bucket: any) => bucket?.cpuThrottle && (bucket.cpuThrottle.p95 > 0 || bucket.cpuThrottle.max > 0)
    );
  }, [plotsData]);

  const hasHistoryData = (historyData?.length ?? 0) > 0;

  // Defer the mount until every async input is known, then show the card
  // only when something will be visible. An OOM fetch error counts — it
  // renders an error state, it is not "no data". While shown, children keep
  // their own empty states (lab expectation: zero-OOM clusters still show
  // the OOM panel beside working history/throttle tiles).
  const oomPending = oomEntries === undefined;
  const inputsPending = oomPending || historyFetchStatus === FetchStatus.inProgress;
  if (inputsPending) {
    return null;
  }
  const hasOomData = (oomEntries ?? []).some(d => d.oom_kill_count > 0);
  const sectionVisible = hasOomData || oomHasError || hasThrottleData || hasHistoryData;
  if (!sectionVisible) {
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
            {/* inputsPending gates on historyFetchStatus, so the chart only renders with history resolved. */}
            <ContainerHistoryChart data={historyData ?? []} />
          </StackItem>
          <StackItem>
            <Title headingLevel="h3" size="md">
              {intl.formatMessage(messages.visualInsightsOomTimeline)}
            </Title>
            <OomTimeline entries={oomEntries} isLoading={oomPending} hasError={oomHasError} />
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
