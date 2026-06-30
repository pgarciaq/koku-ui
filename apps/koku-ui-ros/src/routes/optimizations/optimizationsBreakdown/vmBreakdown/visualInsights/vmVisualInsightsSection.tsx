import { Card, CardBody, CardTitle, Grid, GridItem, Stack, StackItem, Title } from '@patternfly/react-core';
import type { MoneyAmount, VmDailyDigestItem, VmRecommendedSizing, VmSizingBlock } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { VmIoSparkline } from './vmIoSparkline';
import { VmSizingChart } from './vmSizingChart';

interface VmVisualInsightsSectionProps {
  current?: VmSizingBlock;
  dailyDigests?: VmDailyDigestItem[];
  estimatedMonthlySavings?: MoneyAmount;
  recommended?: VmRecommendedSizing;
}

const VmVisualInsightsSection: React.FC<VmVisualInsightsSectionProps> = ({
  current,
  dailyDigests,
  estimatedMonthlySavings,
  recommended,
}) => {
  const intl = useIntl();

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

  if (!hasAnyIoData && !hasSizingData) {
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
        </Grid>
      </CardBody>
    </Card>
  );
};

export { VmVisualInsightsSection };
