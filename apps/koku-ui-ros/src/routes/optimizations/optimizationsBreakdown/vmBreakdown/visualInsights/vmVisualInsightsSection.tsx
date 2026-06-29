import { Card, CardBody, CardTitle, Title } from '@patternfly/react-core';
import type { VmDailyDigestItem } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { VmIoSparkline } from './vmIoSparkline';

interface VmVisualInsightsSectionProps {
  dailyDigests?: VmDailyDigestItem[];
}

const VmVisualInsightsSection: React.FC<VmVisualInsightsSectionProps> = ({ dailyDigests }) => {
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

  if (!hasAnyIoData) {
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
        <Title headingLevel="h3" size="md">
          {intl.formatMessage(messages.visualInsightsVmDiskIo)}
        </Title>
        <VmIoSparkline dailyDigests={dailyDigests} />
      </CardBody>
    </Card>
  );
};

export { VmVisualInsightsSection };
