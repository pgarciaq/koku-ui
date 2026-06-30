import { Title, TitleSizes } from '@patternfly/react-core';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

import { GpuVramUtilizationGauge } from './gpuVramUtilizationGauge';

interface GpuVisualInsightsSectionOwnProps {
  fbUsageMaxMib?: number;
  totalFbMib?: number | null;
}

const GpuVisualInsightsSection: React.FC<GpuVisualInsightsSectionOwnProps> = ({ fbUsageMaxMib, totalFbMib }) => {
  if (!totalFbMib || totalFbMib <= 0 || fbUsageMaxMib == null) {
    return null;
  }

  return (
    <div style={{ marginTop: 24 }}>
      <Title headingLevel="h3" size={TitleSizes.lg} style={{ marginBottom: 12 }}>
        {useIntl().formatMessage(messages.visualInsightsGpuSectionTitle)}
      </Title>
      <GpuVramUtilizationGauge fbUsageMaxMib={fbUsageMaxMib} totalFbMib={totalFbMib} />
    </div>
  );
};

export { GpuVisualInsightsSection };
