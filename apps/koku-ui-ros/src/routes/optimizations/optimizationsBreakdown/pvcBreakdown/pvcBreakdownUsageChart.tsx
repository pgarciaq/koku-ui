import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { Chart, ChartArea, ChartAxis, ChartGroup, ChartLine, ChartThemeColor, ChartVoronoiContainer } from '@patternfly/react-charts/victory';
import type { PvcHistoricalUsagePoint } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { formatStorageBytes } from 'routes/optimizations/optimizationsTable/storageTableUtils';

interface PvcBreakdownUsageChartOwnProps {
  historicalUsage?: PvcHistoricalUsagePoint[];
}

const toGiB = (bytes?: number): number | null => {
  if (bytes == null) {
    return null;
  }
  return bytes / 1024 ** 3;
};

const PvcBreakdownUsageChart: React.FC<PvcBreakdownUsageChartOwnProps> = ({ historicalUsage }) => {
  const intl = useIntl();

  const chartData = useMemo(() => {
    if (!historicalUsage?.length) {
      return null;
    }

    const capacity = historicalUsage.map(point => ({
      x: point.date,
      y: toGiB(point.capacity_bytes) ?? 0,
    }));
    const usageMax = historicalUsage.map(point => ({
      x: point.date,
      y: toGiB(point.usage_bytes_max) ?? 0,
    }));
    const usageAvg = historicalUsage.map(point => ({
      x: point.date,
      y: toGiB(point.usage_bytes_avg) ?? 0,
    }));

    return { capacity, usageAvg, usageMax };
  }, [historicalUsage]);

  if (!chartData) {
    return null;
  }

  return (
    <Card>
      <CardTitle>{intl.formatMessage(messages.pvcUsageHistoryTitle)}</CardTitle>
      <CardBody>
        <div style={{ height: 280 }}>
          <Chart
            ariaDesc={intl.formatMessage(messages.pvcUsageHistoryTitle)}
            ariaTitle={intl.formatMessage(messages.pvcUsageHistoryTitle)}
            containerComponent={<ChartVoronoiContainer labels={({ datum }) => `${datum.x}: ${datum.y?.toFixed(2)} GiB`} />}
            domainPadding={{ x: [20, 20] }}
            height={260}
            padding={{ bottom: 60, left: 70, right: 30, top: 20 }}
            themeColor={ChartThemeColor.multiUnordered}
            width={800}
          >
            <ChartAxis tickFormat={tick => tick} />
            <ChartAxis dependentAxis showGrid tickFormat={tick => `${tick} GiB`} />
            <ChartGroup>
              <ChartArea
                data={chartData.usageMax}
                interpolation="monotoneX"
                name={intl.formatMessage(messages.pvcUsageMax)}
              />
              <ChartLine
                data={chartData.capacity}
                interpolation="monotoneX"
                name={intl.formatMessage(messages.pvcCapacity)}
              />
              <ChartLine
                data={chartData.usageAvg}
                interpolation="monotoneX"
                name={intl.formatMessage(messages.pvcUsageAvg)}
              />
            </ChartGroup>
          </Chart>
        </div>
        <div style={{ fontSize: 'var(--pf-t--global--font--size--sm)', marginTop: 8 }}>
          {intl.formatMessage(messages.pvcUsageHistoryCaption, {
            capacity: formatStorageBytes(historicalUsage?.[historicalUsage.length - 1]?.capacity_bytes),
          })}
        </div>
      </CardBody>
    </Card>
  );
};

export { PvcBreakdownUsageChart };
