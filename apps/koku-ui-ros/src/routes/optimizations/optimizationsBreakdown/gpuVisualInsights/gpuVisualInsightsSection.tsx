import { Grid, GridItem, Title, TitleSizes } from '@patternfly/react-core';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { PeakHoursChartCaption } from 'routes/optimizations/optimizationsBreakdown/shared/peakHoursChartCaption';

import { GpuUtilizationRadarChart } from './gpuUtilizationRadarChart';
import { GpuVramUtilizationGauge } from './gpuVramUtilizationGauge';

export interface GpuUtilizationMetrics {
  dramActiveAvg?: number;
  fbUsageMaxMib?: number;
  smActiveAvg?: number;
  tensorPipeActiveAvg?: number;
  totalFbMib?: number | null;
}

interface GpuVisualInsightsSectionOwnProps extends GpuUtilizationMetrics {
  peakHours?: GpuUtilizationMetrics;
  showPeakHoursCharts?: boolean;
}

const hasVramData = (totalFbMib?: number | null, fbUsageMaxMib?: number) =>
  totalFbMib != null && totalFbMib > 0 && fbUsageMaxMib != null;

export const hasGpuRadarData = (metrics?: GpuUtilizationMetrics) =>
  metrics != null &&
  (metrics.smActiveAvg != null ||
    metrics.tensorPipeActiveAvg != null ||
    metrics.dramActiveAvg != null ||
    hasVramData(metrics.totalFbMib, metrics.fbUsageMaxMib));

const GpuMetricCharts: React.FC<{
  metrics: GpuUtilizationMetrics;
  radarDesc: string;
  radarTitle: string;
}> = ({ metrics, radarDesc, radarTitle }) => {
  const showVram = hasVramData(metrics.totalFbMib, metrics.fbUsageMaxMib);
  const showRadar = hasGpuRadarData(metrics);

  return (
    <Grid hasGutter>
      {showRadar && (
        <GridItem span={6} sm={12} md={6}>
          <GpuUtilizationRadarChart
            desc={radarDesc}
            dramActiveAvg={metrics.dramActiveAvg}
            fbUsageMaxMib={metrics.fbUsageMaxMib}
            smActiveAvg={metrics.smActiveAvg}
            tensorPipeActiveAvg={metrics.tensorPipeActiveAvg}
            title={radarTitle}
            totalFbMib={metrics.totalFbMib}
          />
        </GridItem>
      )}
      {showVram && (
        <GridItem span={6} sm={12} md={6}>
          <GpuVramUtilizationGauge fbUsageMaxMib={metrics.fbUsageMaxMib} totalFbMib={metrics.totalFbMib} />
        </GridItem>
      )}
    </Grid>
  );
};

const GpuVisualInsightsSection: React.FC<GpuVisualInsightsSectionOwnProps> = ({
  dramActiveAvg,
  fbUsageMaxMib,
  peakHours,
  showPeakHoursCharts,
  smActiveAvg,
  tensorPipeActiveAvg,
  totalFbMib,
}) => {
  const intl = useIntl();

  const allHours: GpuUtilizationMetrics = {
    dramActiveAvg,
    fbUsageMaxMib,
    smActiveAvg,
    tensorPipeActiveAvg,
    totalFbMib,
  };
  const showAllHours = hasGpuRadarData(allHours);
  const showPeakHours = Boolean(showPeakHoursCharts) && hasGpuRadarData(peakHours);

  if (!showAllHours && !showPeakHours) {
    return null;
  }

  return (
    <div style={{ marginTop: 24 }}>
      {showAllHours && (
        <>
          <Title headingLevel="h3" size={TitleSizes.lg} style={{ marginBottom: 12 }}>
            {intl.formatMessage(messages.visualInsightsGpuSectionTitle)}
          </Title>
          <GpuMetricCharts
            metrics={allHours}
            radarDesc={intl.formatMessage(messages.visualInsightsGpuRadarDesc)}
            radarTitle={intl.formatMessage(messages.visualInsightsGpuRadarTitle)}
          />
        </>
      )}
      {showPeakHours && peakHours && (
        <div data-testid="gpu-peak-hours-visual-insights" style={{ marginTop: showAllHours ? 24 : 0 }}>
          <Title headingLevel="h3" size={TitleSizes.lg} style={{ marginBottom: 12 }}>
            {intl.formatMessage(messages.visualInsightsGpuPeakHoursSectionTitle)}
          </Title>
          <PeakHoursChartCaption />
          <GpuMetricCharts
            metrics={peakHours}
            radarDesc={intl.formatMessage(messages.visualInsightsGpuRadarDesc)}
            radarTitle={intl.formatMessage(messages.visualInsightsGpuPeakHoursRadarTitle)}
          />
        </div>
      )}
    </div>
  );
};

export { GpuVisualInsightsSection };
