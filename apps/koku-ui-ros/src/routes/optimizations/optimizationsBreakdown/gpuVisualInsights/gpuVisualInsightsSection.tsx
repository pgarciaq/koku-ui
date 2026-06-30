import { Grid, GridItem, Title, TitleSizes } from '@patternfly/react-core';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

import { GpuUtilizationRadarChart } from './gpuUtilizationRadarChart';
import { GpuVramUtilizationGauge } from './gpuVramUtilizationGauge';

interface GpuVisualInsightsSectionOwnProps {
  dramActiveAvg?: number;
  fbUsageMaxMib?: number;
  smActiveAvg?: number;
  tensorPipeActiveAvg?: number;
  totalFbMib?: number | null;
}

const hasVramData = (totalFbMib?: number | null, fbUsageMaxMib?: number) =>
  totalFbMib != null && totalFbMib > 0 && fbUsageMaxMib != null;

const hasRadarData = (
  smActiveAvg?: number,
  tensorPipeActiveAvg?: number,
  dramActiveAvg?: number,
  fbUsageMaxMib?: number,
  totalFbMib?: number | null
) =>
  smActiveAvg != null ||
  tensorPipeActiveAvg != null ||
  dramActiveAvg != null ||
  hasVramData(totalFbMib, fbUsageMaxMib);

const GpuVisualInsightsSection: React.FC<GpuVisualInsightsSectionOwnProps> = ({
  dramActiveAvg,
  fbUsageMaxMib,
  smActiveAvg,
  tensorPipeActiveAvg,
  totalFbMib,
}) => {
  const intl = useIntl();

  const showVram = hasVramData(totalFbMib, fbUsageMaxMib);
  const showRadar = hasRadarData(smActiveAvg, tensorPipeActiveAvg, dramActiveAvg, fbUsageMaxMib, totalFbMib);

  if (!showVram && !showRadar) {
    return null;
  }

  return (
    <div style={{ marginTop: 24 }}>
      <Title headingLevel="h3" size={TitleSizes.lg} style={{ marginBottom: 12 }}>
        {intl.formatMessage(messages.visualInsightsGpuSectionTitle)}
      </Title>
      <Grid hasGutter>
        {showRadar && (
          <GridItem span={6} sm={12} md={6}>
            <GpuUtilizationRadarChart
              dramActiveAvg={dramActiveAvg}
              fbUsageMaxMib={fbUsageMaxMib}
              smActiveAvg={smActiveAvg}
              tensorPipeActiveAvg={tensorPipeActiveAvg}
              totalFbMib={totalFbMib}
            />
          </GridItem>
        )}
        {showVram && (
          <GridItem span={6} sm={12} md={6}>
            <GpuVramUtilizationGauge fbUsageMaxMib={fbUsageMaxMib} totalFbMib={totalFbMib} />
          </GridItem>
        )}
      </Grid>
    </div>
  );
};

export { GpuVisualInsightsSection };
