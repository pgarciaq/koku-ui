import { Card, CardBody, CardTitle, Grid, GridItem, Spinner, Stack, StackItem, Title } from '@patternfly/react-core';
import type { NodeDailyDigestItem } from 'api/ros/recommendations';
import { useNodeHourlyUtilization } from 'hooks/useNodeHourlyUtilization';
import messages from 'locales/messages';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { PeakHoursChartCaption } from 'routes/optimizations/optimizationsBreakdown/shared/peakHoursChartCaption';
import type { HeatmapDataPoint } from 'routes/optimizations/visualInsightsUtils';
import { UtilizationHeatmap } from 'routes/optimizations/visualInsightsUtils';
import { FetchStatus } from 'store/common';

import { NodePodHeadroomGauge } from './nodePodHeadroomGauge';
import { NodePeakHoursUsageChart, NodeRequestGapChart, NodeUtilizationTrend } from './visualInsights';

interface NodeVisualInsightsSectionOwnProps {
  clusterUuid?: string;
  dailyDigests?: NodeDailyDigestItem[];
  dailyDigestsBusinessHours?: NodeDailyDigestItem[];
  lastReported?: string;
  nodeName?: string;
  peakHoursCpuCores?: number | null;
  peakHoursMemoryGib?: number | null;
  podCapacity: number;
  podCount: number;
  showPeakHoursCharts?: boolean;
  targetUtilizationBP?: number;
}

const NodeVisualInsightsSection: React.FC<NodeVisualInsightsSectionOwnProps> = ({
  clusterUuid,
  dailyDigests,
  dailyDigestsBusinessHours,
  lastReported,
  nodeName,
  peakHoursCpuCores,
  peakHoursMemoryGib,
  podCapacity,
  podCount,
  showPeakHoursCharts,
  targetUtilizationBP,
}) => {
  const intl = useIntl();

  const hourlyParams = useMemo(() => {
    if (!clusterUuid || !nodeName) {
      return null;
    }
    return { cluster_uuid: clusterUuid, node_name: nodeName, days: 14 };
  }, [clusterUuid, nodeName]);

  const { data: hourlyData, fetchStatus: hourlyFetchStatus } = useNodeHourlyUtilization(hourlyParams);

  const heatmapPoints: HeatmapDataPoint[] = useMemo(() => {
    if (!hourlyData?.data) {
      return [];
    }
    return hourlyData.data.map(row => ({
      report_date: row.report_date,
      hour: row.hour,
      value: row.cpu_usage_p95_mc,
    }));
  }, [hourlyData]);

  const heatmapMaxValue = useMemo(() => {
    if (!heatmapPoints.length) {
      return 0;
    }
    return Math.max(...heatmapPoints.map(p => p.value));
  }, [heatmapPoints]);

  const hasPodHeadroom = podCapacity > 0;
  const hasDigests = dailyDigests && dailyDigests.length > 0;
  const hasBhDigests = Boolean(dailyDigestsBusinessHours && dailyDigestsBusinessHours.length > 0);
  const showPeakHoursUsage = Boolean(showPeakHoursCharts) && hasBhDigests;
  const hasRequestData = hasDigests && dailyDigests.some(d => d.max_cpu_requests_mc > 0 || d.max_mem_requests_kib > 0);

  if (!hasPodHeadroom && !hasDigests && !showPeakHoursUsage && !hourlyParams) {
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
          <div style={{ marginBottom: hasDigests || hourlyParams ? 24 : 0 }}>
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
        {showPeakHoursUsage && (
          <div data-testid="node-peak-hours-usage" style={{ marginTop: hasDigests ? 24 : 0 }}>
            <Title headingLevel="h3" size="md" style={{ marginBottom: 8 }}>
              {intl.formatMessage(messages.visualInsightsPeakHoursSectionTitle)}
            </Title>
            <PeakHoursChartCaption />
            <Grid hasGutter>
              <GridItem md={6}>
                <Title headingLevel="h4" size="md">
                  {intl.formatMessage(messages.visualInsightsNodePeakHoursCpuTitle)}
                </Title>
                <NodePeakHoursUsageChart
                  dailyDigests={dailyDigestsBusinessHours ?? []}
                  metricKey="cpu"
                  recommendedValue={peakHoursCpuCores}
                />
              </GridItem>
              <GridItem md={6}>
                <Title headingLevel="h4" size="md">
                  {intl.formatMessage(messages.visualInsightsNodePeakHoursMemoryTitle)}
                </Title>
                <NodePeakHoursUsageChart
                  dailyDigests={dailyDigestsBusinessHours ?? []}
                  metricKey="memory"
                  recommendedValue={peakHoursMemoryGib}
                />
              </GridItem>
            </Grid>
          </div>
        )}
        {hasDigests && hasRequestData && (
          <div style={{ marginTop: 24 }}>
            <Grid hasGutter>
              <GridItem md={6}>
                <Title headingLevel="h3" size="md">
                  {intl.formatMessage(messages.visualInsightsNodeRequestGapCpuTitle)}
                </Title>
                <NodeRequestGapChart dailyDigests={dailyDigests} metricKey="cpu" />
              </GridItem>
              <GridItem md={6}>
                <Title headingLevel="h3" size="md">
                  {intl.formatMessage(messages.visualInsightsNodeRequestGapMemTitle)}
                </Title>
                <NodeRequestGapChart dailyDigests={dailyDigests} metricKey="memory" />
              </GridItem>
            </Grid>
          </div>
        )}
        {hourlyParams && (
          <div style={{ marginTop: hasDigests ? 24 : 0 }}>
            <Stack hasGutter>
              <StackItem>
                <Title headingLevel="h3" size="md">
                  {intl.formatMessage(messages.visualInsightsNodeActivityHeatmap)}
                </Title>
                <div style={{ fontSize: 13, color: 'var(--pf-t--global--text--color--subtle)' }}>
                  {intl.formatMessage(messages.visualInsightsNodeActivityHeatmapDesc)}
                </div>
              </StackItem>
              <StackItem>
                {hourlyFetchStatus === FetchStatus.inProgress ? (
                  <Spinner size="lg" aria-label="Loading" />
                ) : (
                  <UtilizationHeatmap
                    data={heatmapPoints}
                    maxValue={heatmapMaxValue}
                    metricLabel="mCPU"
                    entityLabel={nodeName ?? 'Node'}
                    valueFormatter={(v: number) => `${v}`}
                  />
                )}
              </StackItem>
            </Stack>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export { NodeVisualInsightsSection };
