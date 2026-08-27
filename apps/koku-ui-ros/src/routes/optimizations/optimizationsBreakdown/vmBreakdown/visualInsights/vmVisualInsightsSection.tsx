import { Card, CardBody, CardTitle, Grid, GridItem, Spinner, Stack, StackItem, Title } from '@patternfly/react-core';
import type { MoneyAmount, VmDailyDigestItem, VmRecommendedSizing, VmSizingBlock } from 'api/ros/recommendations';
import { useVmHourlyActivity } from 'hooks/useVmHourlyActivity';
import messages from 'locales/messages';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { PeakHoursChartCaption } from 'routes/optimizations/optimizationsBreakdown/shared/peakHoursChartCaption';
import type { HeatmapDataPoint } from 'routes/optimizations/visualInsightsUtils';
import { UtilizationHeatmap } from 'routes/optimizations/visualInsightsUtils';
import { FetchStatus } from 'store/common';

import { VmIoSparkline } from './vmIoSparkline';
import { VmSizingChart } from './vmSizingChart';
import { VmUtilizationTrendChart } from './vmUtilizationTrendChart';

interface VmVisualInsightsSectionProps {
  clusterUuid?: string;
  current?: VmSizingBlock;
  dailyDigests?: VmDailyDigestItem[];
  dailyDigestsBusinessHours?: VmDailyDigestItem[];
  estimatedMonthlySavings?: MoneyAmount;
  namespace?: string;
  peakHoursMemoryGib?: number | null;
  peakHoursVcpu?: number | null;
  recommended?: VmRecommendedSizing;
  showPeakHoursCharts?: boolean;
  vmName?: string;
}

const VmVisualInsightsSection: React.FC<VmVisualInsightsSectionProps> = ({
  clusterUuid,
  current,
  dailyDigests,
  dailyDigestsBusinessHours,
  estimatedMonthlySavings,
  namespace,
  peakHoursMemoryGib,
  peakHoursVcpu,
  recommended,
  showPeakHoursCharts,
  vmName,
}) => {
  const intl = useIntl();

  const hourlyParams = useMemo(() => {
    if (!clusterUuid || !namespace || !vmName) {
      return null;
    }
    return { cluster_uuid: clusterUuid, namespace, vm_name: vmName, days: 14 };
  }, [clusterUuid, namespace, vmName]);

  const { data: hourlyData, fetchStatus: hourlyFetchStatus } = useVmHourlyActivity(hourlyParams);

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
    const capacityMc = current?.vcpu != null ? current.vcpu * 1000 : 0;
    const observedMax = Math.max(...heatmapPoints.map(p => p.value));
    return capacityMc > 0 ? capacityMc : observedMax;
  }, [heatmapPoints, current]);

  const hasAnyIoData = useMemo(() => {
    if (!dailyDigests || dailyDigests.length === 0) {
      return false;
    }
    return dailyDigests.some(
      d =>
        (d.disk_read_iops_p95 != null && d.disk_read_iops_p95 > 0) ||
        (d.disk_write_iops_p95 != null && d.disk_write_iops_p95 > 0) ||
        (d.disk_read_bps_p95 != null && d.disk_read_bps_p95 > 0) ||
        (d.disk_write_bps_p95 != null && d.disk_write_bps_p95 > 0)
    );
  }, [dailyDigests]);

  const hasSizingData = useMemo(() => {
    return (
      current?.vcpu != null &&
      current?.memory_gib != null &&
      recommended?.vcpu != null &&
      recommended?.memory_gib != null
    );
  }, [current, recommended]);

  const hasUtilizationData = useMemo(() => {
    if (!dailyDigests || dailyDigests.length === 0) {
      return false;
    }
    return dailyDigests.some(d => d.cpu_usage_p95_mc != null || d.mem_usage_p95_kib != null);
  }, [dailyDigests]);

  const hasPeakHoursUtilization = useMemo(() => {
    if (!showPeakHoursCharts || !dailyDigestsBusinessHours || dailyDigestsBusinessHours.length === 0) {
      return false;
    }
    return dailyDigestsBusinessHours.some(d => d.cpu_usage_p95_mc != null || d.mem_usage_p95_kib != null);
  }, [dailyDigestsBusinessHours, showPeakHoursCharts]);

  if (!hasAnyIoData && !hasSizingData && !hasUtilizationData && !hasPeakHoursUtilization && !hourlyParams) {
    return null;
  }

  const cpuRecommendedMc = recommended?.vcpu != null ? recommended.vcpu * 1000 : null;
  const memRecommendedKib = recommended?.memory_gib != null ? recommended.memory_gib * 1024 * 1024 : null;
  const peakHoursCpuMc = peakHoursVcpu != null ? peakHoursVcpu * 1000 : null;
  const peakHoursMemKib = peakHoursMemoryGib != null ? peakHoursMemoryGib * 1024 * 1024 : null;

  return (
    <Card>
      <CardTitle>
        <Title headingLevel="h2" size="lg">
          {intl.formatMessage(messages.visualInsights)}
        </Title>
      </CardTitle>
      <CardBody>
        <Grid hasGutter>
          {hasSizingData && (
            <GridItem md={6} sm={12}>
              <Stack hasGutter>
                <StackItem>
                  <Title headingLevel="h3" size="md">
                    {intl.formatMessage(messages.visualInsightsVmSizingTitle)}
                  </Title>
                </StackItem>
                <StackItem>
                  <VmSizingChart
                    current={current}
                    recommended={recommended}
                    estimatedMonthlySavings={estimatedMonthlySavings}
                  />
                </StackItem>
              </Stack>
            </GridItem>
          )}
          {hasAnyIoData && (
            <GridItem md={hasSizingData ? 6 : 12} sm={12}>
              <Stack hasGutter>
                <StackItem>
                  <Title headingLevel="h3" size="md">
                    {intl.formatMessage(messages.visualInsightsVmDiskIo)}
                  </Title>
                </StackItem>
                <StackItem>
                  <VmIoSparkline dailyDigests={dailyDigests} />
                </StackItem>
              </Stack>
            </GridItem>
          )}
          {hasUtilizationData && (
            <GridItem sm={12}>
              <Stack hasGutter>
                <StackItem>
                  <Title headingLevel="h3" size="md">
                    {intl.formatMessage(messages.visualInsightsVmUtilizationTrends)}
                  </Title>
                </StackItem>
                <StackItem>
                  <Grid hasGutter>
                    <GridItem md={6} sm={12}>
                      <Title headingLevel="h4" size="md">
                        {intl.formatMessage(messages.visualInsightsVmCpuTrendTitle)}
                      </Title>
                      <VmUtilizationTrendChart
                        dailyDigests={dailyDigests}
                        metricKey="cpu"
                        recommendedValue={cpuRecommendedMc}
                      />
                    </GridItem>
                    <GridItem md={6} sm={12}>
                      <Title headingLevel="h4" size="md">
                        {intl.formatMessage(messages.visualInsightsVmMemoryTrendTitle)}
                      </Title>
                      <VmUtilizationTrendChart
                        dailyDigests={dailyDigests}
                        metricKey="memory"
                        recommendedValue={memRecommendedKib}
                      />
                    </GridItem>
                  </Grid>
                </StackItem>
              </Stack>
            </GridItem>
          )}
          {hasPeakHoursUtilization && (
            <GridItem sm={12} data-testid="vm-peak-hours-usage">
              <Stack hasGutter>
                <StackItem>
                  <Title headingLevel="h3" size="md">
                    {intl.formatMessage(messages.visualInsightsPeakHoursSectionTitle)}
                  </Title>
                  <PeakHoursChartCaption />
                </StackItem>
                <StackItem>
                  <Grid hasGutter>
                    <GridItem md={6} sm={12}>
                      <Title headingLevel="h4" size="md">
                        {intl.formatMessage(messages.visualInsightsVmPeakHoursCpuTitle)}
                      </Title>
                      <VmUtilizationTrendChart
                        dailyDigests={dailyDigestsBusinessHours ?? []}
                        metricKey="cpu"
                        recommendedValue={peakHoursCpuMc}
                        testId="vm-peak-hours-trend-cpu"
                      />
                    </GridItem>
                    <GridItem md={6} sm={12}>
                      <Title headingLevel="h4" size="md">
                        {intl.formatMessage(messages.visualInsightsVmPeakHoursMemoryTitle)}
                      </Title>
                      <VmUtilizationTrendChart
                        dailyDigests={dailyDigestsBusinessHours ?? []}
                        metricKey="memory"
                        recommendedValue={peakHoursMemKib}
                        testId="vm-peak-hours-trend-memory"
                      />
                    </GridItem>
                  </Grid>
                </StackItem>
              </Stack>
            </GridItem>
          )}
          {hourlyParams && (
            <GridItem sm={12}>
              <Stack hasGutter>
                <StackItem>
                  <Title headingLevel="h3" size="md">
                    {intl.formatMessage(messages.visualInsightsVmActivityHeatmap)}
                  </Title>
                  <div style={{ fontSize: 13, color: 'var(--pf-t--global--text--color--subtle)' }}>
                    {intl.formatMessage(messages.visualInsightsVmActivityHeatmapDesc)}
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
                      entityLabel={vmName ?? 'VM'}
                      valueFormatter={(v: number) => `${v}`}
                    />
                  )}
                </StackItem>
              </Stack>
            </GridItem>
          )}
        </Grid>
      </CardBody>
    </Card>
  );
};

export { VmVisualInsightsSection };
